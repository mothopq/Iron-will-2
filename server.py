import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def send_head(self):
        # Remove cabeçalhos condicionais para forçar resposta 200 com arquivo atualizado
        for h in list(self.headers.keys()):
            if h.lower() in ('if-modified-since', 'if-none-match'):
                del self.headers[h]
        return super().send_head()

    def end_headers(self):
        # Desabilita cache estritamente para evitar versões desatualizadas de módulos JS
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

class ThreadedServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True

with ThreadedServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Servidor No-Cache rodando em http://localhost:{PORT}")
    httpd.serve_forever()

