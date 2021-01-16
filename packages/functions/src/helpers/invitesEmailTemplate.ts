export const invitesEmailTemplate = `
<!DOCTYPE html>
<html lang="PT">
    <head>
        <meta charset="utf-8" />
        <style type="text/css">
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            }

            img {
                width: 100%;
                max-width: 560px;
            }

            a {
                text-decoration: underline;
                color: #1376c8;
            }
        </style>
    </head>
    <body>
        <main>
            <h2>Você foi convidada(o)&nbsp;a administrar dados do MLB!</h2>
            <img alt="logo do MLB" src="https://static.wixstatic.com/media/ab3c6b_558054aee51f4bcc9e562979aefb8e10~mv2.jpg/v1/fill/w_979,h_141,al_c,q_80,usm_0.66_1.00_0.01/ab3c6b_558054aee51f4bcc9e562979aefb8e10~mv2.webp" />

            <p>Seu email foi convidado por um dos administradores do sistema para que você também possa editar os dados dos filiados ao movimento e das ocupações.</p>

            <p>Para acessar o sistema, click <a target="_blank" href="https://${process.env.APP_DOMAIN}/">aqui</a> e acesse o sistema.</p>

            <p>
                Caso você não esteja conseguinho acessar o link acima, copie e cole o link abaixo:<br />
                https://${process.env.APP_DOMAIN}/
            </p>
        </main>
    </body>
</html>
`;
