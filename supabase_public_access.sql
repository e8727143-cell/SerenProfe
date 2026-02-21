-- Permitir acceso público a la tabla de usuarios autorizados (Para que funcione el "Soft Login")
-- ADVERTENCIA: Esto permite que cualquiera lea/modifique la lista si tiene las credenciales de Supabase.
-- Se hace para cumplir con el requerimiento de "entrar sin verificar email".

drop policy if exists "Enable read access for all users" on usuarios_autorizados;
drop policy if exists "Enable insert for all users" on usuarios_autorizados;
drop policy if exists "Enable delete for all users" on usuarios_autorizados;

create policy "Enable read access for all users" on usuarios_autorizados for select using (true);
create policy "Enable insert for all users" on usuarios_autorizados for insert with check (true);
create policy "Enable delete for all users" on usuarios_autorizados for delete using (true);
