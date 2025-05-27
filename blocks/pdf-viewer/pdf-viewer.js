const loadScript = () => {
  const head = document.querySelector('head');
  const script = document.createElement('script');
  script.src = 'https://documentcloud.adobe.com/view-sdk/main.js';
  head.append(script);
  return script;
};

const loadClientId = async () => {
  try {
    const myHeaders = {};
    myHeaders['Content-Type'] = 'application/json';
    myHeaders.Accept = 'application/json';
    myHeaders.Authorization = 'Bearer eyJhbGciOiJSUzI1NiIsIng1dSI6Imltc19uYTEta2V5LWF0LTEuY2VyIiwia2lkIjoiaW1zX25hMS1rZXktYXQtMSIsIml0dCI6ImF0In0...';
    myHeaders['x-gw-ims-org-id'] = 'C0B99765576A7A987F000101@AdobeOrg';

    // Static endpoint - only production Adobe I/O Runtime URL
    const apiEndpoint = 'https://42795-ddax.adobeioruntime.net/api/v1/web/ddax-adobe-io/client-id';

    // Try a simpler GET request first
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        Authorization: myHeaders.Authorization,
        'x-gw-ims-org-id': myHeaders['x-gw-ims-org-id'],
        // Remove Content-Type and Accept to see if they're causing issues
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      console.error('Full response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText,
      });
      throw new Error(`Failed to fetch API key: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw response was:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    return data.clientId;
  } catch (error) {
    console.error('PDF Viewer: Error initializing pdf viewer', error);
  }
};

export default async function decorate(block) {
  const [fileDiv, embedDiv] = [...block.children];
  const filePathContainer = fileDiv.querySelector('p');
  const filePath = filePathContainer ? filePathContainer.innerText : null;
  const embedContainer = embedDiv.querySelector('p');
  const embedMode = embedContainer ? embedContainer.innerText : 'SIZED_CONTAINER';

  if (filePath) {
    loadScript();
    const clientId = await loadClientId();

    const pdfViewer = document.createElement('div');
    pdfViewer.id = 'pdf-viewer';
    block.replaceChildren();
    block.append(pdfViewer);

    if (embedMode === 'IN_LINE') {
      block.style.height = 'auto';
    }

    document.addEventListener('adobe_dc_view_sdk.ready', () => {
      const adobeDCView = new AdobeDC.View({
        clientId,
        divId: 'pdf-viewer',
      });

      // Determine the correct PDF URL based on the file path
      let pdfUrl;

      if (filePath.startsWith('/content/dam/')) {
        // If it's a DAM path, convert it to a repository path
        // Example: /content/dam/pdfs/sample.pdf -> /pdfs/sample.pdf
        pdfUrl = filePath.replace('/content/dam/', '/');
      } else if (filePath.startsWith('http')) {
        // If it's already a full URL, use it as is
        pdfUrl = filePath;
      } else {
        // If it's a relative path, use it with current origin
        pdfUrl = window.location.origin + filePath;
      }

      console.log('PDF URL:', pdfUrl);

      adobeDCView.previewFile({
        content: { location: { url: pdfUrl } },
        metaData: { fileName: filePath.split('/').pop() },
      }, { embedMode });
    });
  }
}
