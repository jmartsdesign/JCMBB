import sys
import time
import threading
import webbrowser
import ssl
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Configuration
ip = "192.168.1.214"
port = 4443  # Default HTTPS port is 443, but we'll use 4443 for local development
url = f"https://{ip}:{port}"
server_address = (ip, port)

# SSL certificate and key paths (adjust these paths based on where your certificate is stored)
cert_file = './JCMBB/server.crt'  # Path to the SSL certificate file
key_file = './JCMBB/server.key'   # Path to the SSL key file
key_passphrase = b'jardim'  # Replace with the actual passphrase for the key

# Create the HTTPServer instance
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

# Create SSL context
context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)

# Load the certificate and key with passphrase
context.load_cert_chain(certfile=cert_file, keyfile=key_file, password=key_passphrase)

# Wrapping the HTTP server's socket with SSL
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

# Function to start the server
def start_server():
    print(f"Starting HTTPS server at {url}, CTRL + C to stop and close")
    httpd.serve_forever()

# Function to open the browser
def open_browser():
    time.sleep(1)  # Give the server a moment to start
    webbrowser.open_new(url)

# Start the server in a separate thread
server_thread = threading.Thread(target=start_server)
server_thread.daemon = True  # Ensures the thread will exit when the main program exits
server_thread.start()

# Open the browser in the main thread
open_browser()

# Wait for server shutdown
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nShutting down server...")
    httpd.shutdown()
    sys.exit(0)
