import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Add polyfill for WebAssembly */}
          <script src="https://cdn.jsdelivr.net/npm/wasm-feature-detect@1.2.11/dist/umd/index.js"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              wasmFeatureDetect.asyncify().then(hasAsyncify => {
                if (!hasAsyncify) {
                  var script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13.7/runtime.min.js';
                  document.head.appendChild(script);
                }
              });
            `
          }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
