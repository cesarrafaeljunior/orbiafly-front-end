# API de produção na mesma origem

O bundle publicado continha `http://localhost:4000/api/v1`, apontando para o dispositivo do visitante. A configuração de produção agora usa `/api/v1`, com substituição de ambiente no Angular. Sem mudanças de regras de negócio, credenciais ou banco. A validação de login com uma conta atual está pendente.
