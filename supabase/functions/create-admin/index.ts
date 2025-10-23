import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: requestData } = await req.json();
    const username = requestData?.username || 'admin';
    const password = requestData?.password || 'admin123';
    const fullName = requestData?.full_name || 'Administrador';
    const email = requestData?.email || `${username}@internal.local`;

    const { data: existingUser } = await supabase
      .from('user_roles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Username already exists' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
        full_name: fullName
      }
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: hashResult, error: hashError } = await supabase.rpc('hash_password', {
      p_password: password
    });

    if (hashError || !hashResult) {
      await supabase.auth.admin.deleteUser(authData.user.id);

      return new Response(
        JSON.stringify({ error: 'Failed to hash password' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        username: username,
        password_hash: hashResult,
        full_name: fullName,
        role: 'ADMIN',
        is_active: true
      });

    if (insertError) {
      await supabase.auth.admin.deleteUser(authData.user.id);

      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        username: username,
        user_id: authData.user.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});