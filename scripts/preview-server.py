import http.server, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist')
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s, *a, **k): super().__init__(*a, directory=D, **k)
    def do_GET(s):
        p = s.path.split('?')[0].rstrip('/')
        if p and '.' not in os.path.basename(p) and os.path.exists(D + p + '.html'):
            s.path = p + '.html'
        super().do_GET()
http.server.ThreadingHTTPServer(('', int(os.environ.get('PORT', 4174))), H).serve_forever()
