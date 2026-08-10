# Escala Veterinaria compartilhada

## 1. Preparar o Supabase

1. Abra o projeto no Supabase.
2. Entre em **SQL Editor**.
3. Crie uma nova consulta.
4. Cole todo o conteudo de `supabase-setup.sql`.
5. Clique em **Run**.

## 2. Publicar no GitHub Pages

1. Envie todos os arquivos e pastas para a raiz do repositorio.
2. Mantenha `index.html` na raiz.
3. Confirme a publicacao em **Settings > Pages**.
4. Aguarde alguns minutos e abra o site com `?v=4` ao final para evitar cache.

## 3. Sincronizacao

Depois de executar o SQL, nomes e trocas serao salvos no Supabase e compartilhados entre os aparelhos.

## Seguranca

A chave configurada e a chave publica publishable. Nunca use a chave `service_role` no GitHub ou no navegador.
As regras atuais permitem alteracao por qualquer pessoa que tenha o link. Para restringir a Rebeca e ao administrador, o proximo passo e adicionar login.
