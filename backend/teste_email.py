# import smtplib

# EMAIL = "thundergametm@gmail.com"
# SENHA = "lcrw hhuj ggus sfey"

# server = smtplib.SMTP("smtp.gmail.com", 587)
# server.starttls()

# try:
#     # server.login(EMAIL, SENHA)
#     print("✅ Conectado ao Gmail!")

#     destinatario = "razerkirito@gmail.com"  # Coloque um e-mail real para testar
#     mensagem = "Subject: Teste de Envio via SMTP\n\nEste é um e-mail de teste enviado diretamente pelo Python."

#     server.sendmail(EMAIL, destinatario, mensagem.encode("utf-8"))
#     print(f"✅ E-mail enviado para {destinatario}")

# except smtplib.SMTPAuthenticationError:
#     print("❌ Erro de autenticação! Verifique a senha de aplicativo.")
# except Exception as e:
#     print(f"❌ Erro ao enviar e-mail: {e}")

# server.quit()
