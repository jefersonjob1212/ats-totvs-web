# Projeto ATS - TOTVS

Este projeto foi desenvolvido utilizando a versão 19.2.8 do Angular.
Para desenvolvimento também foi utilizado o PO-UI, framework de componentes da Totvs.

## Para executar o projeto

Baixe esse projeto localmente e execute ele com o seguinte comando:
- Caso já tenha o Angular:
```bash
ng serve
```

Ou rode com o comando do npm
```bash
npm start
```

O projeto irá abrir na porta padrão do Angular, `http://localhost:4200/`.

## Para rodar no Docker

Para rodar no Docker, basta acessar a pasta raiz do projeto e executar os comandos:
 ```bash
docker build --no-cache -t ats-totvs-web:latest .
docker run -d -p 8080:80 --name ats-totvs-web ats-totvs-web:latest
 ```

O projeto irá abrir na porta 8080, `http://localhost:8080`.

## Executando os testes unitários

Para executar os testes unitários, utilize o seguinte comando:

```bash
ng test
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
