'''
The MIT License (MIT)

Copyright (c) 2017 Thunderclouding.com - exhesham

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
'''


#http://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_setup/py_setup_in_windows/py_setup_in_windows.html
from flask import Flask, jsonify
from flask import send_file
import os

app = Flask(__name__)

# context = SSL.Context(SSL.SSLv23_METHOD)
# context.use_privatekey_file('server_key.pem')
# context.use_certificate_file('server_cert.crt')

from flask import send_from_directory
@app.route('/image/<name>')
def image_logo(name):
    print "log from ",app.root_path
    return send_from_directory(os.path.join(app.root_path, 'templates'),
                               name, mimetype='image/vnd.microsoft.icon')

@app.route('/favicon.ico')
def favicon():
    print "favicon from ",app.root_path
    return send_from_directory(os.path.join(app.root_path, 'templates'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/assets/images/<image>')
@app.route('/<name>')
@app.route('/')
def main_template(name=None,image=None):

    if not name and not image:
        name = 'index.html'
    if image:
        resource_path =os.path.join('templates','assets','images', image)
    else:
        resource_path =os.path.join('templates', name)
    print resource_path
    return send_file(resource_path)


@app.route('/api/camera/list', methods=['GET'])
def get_cameras():
    return jsonify({'status': 'success', 'cameras': [{'name':'aaa'}]}), 200

if __name__ == '__main__':
    #app.run(debug=True, port=8081,host="0.0.0.0", ssl_context=('server_cert.crt','server_key.pem'),  threaded=True)
    app.run(debug=False, port=8080,host="0.0.0.0", threaded=True)
