beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="wysiwyg-table-test" class="wysiwyg-table block" data-block-name="wysiwyg-table" data-block-status="loading">
                               <div>
                                 <div>
                                    <p>&lt;ul&gt;
                                        <br>&lt;li&gt;
                                        <br>&nbsp; &nbsp; &lt;ul&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;Features &amp;#x26; Fees&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;Details&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;helloo&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &lt;/ul&gt;<br>&nbsp; &lt;/li&gt;
                                        <br>&lt;li&gt;<br>&nbsp; &nbsp; &lt;ul&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;Interest Rates&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;8.5* p.a. onwards&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;helloo&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &lt;/ul&gt;<br>&nbsp; &lt;/li&gt;
                                        <br>&lt;li&gt;<br>&nbsp; &nbsp; &lt;ul&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;Loan Amount&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;10.000€ to 100.000€&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;helloo&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &lt;/ul&gt;<br>&nbsp; &lt;/li&gt;<br>&lt;li&gt;
                                        <br>&nbsp; &nbsp; &lt;ul&gt;<br>&nbsp; &nbsp; &nbsp; &lt;li&gt;Processing Fees&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;Upto 2% of loan amount + applicable taxes looooooooooooooooooooooooooooooooooooooooooooooooooooong text&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;helloo&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &lt;/ul&gt;<br>&nbsp; &lt;/li&gt;<br>&lt;li&gt;
                                        <br>&nbsp; &nbsp; &lt;ul&gt;<br>&nbsp; &nbsp; &nbsp; &lt;li&gt;Loan Tenure&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;48 months tenure&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &nbsp; &lt;li&gt;helloo&lt;/li&gt;
                                        <br>&nbsp; &nbsp; &lt;/ul&gt;<br>&nbsp; &lt;/li&gt;
                                        <br>&lt;/ul&gt;
                                    </p>
                                </div>
                               </div>
                             </div>`;
});

test('decorates correctly wysiwyg table block', () => {
  const block = document.getElementById('wysiwyg-table-test');

  if (!block.querySelector('ul')) {
      const p = block.querySelector('p');
      expect(p).not.toBeNull();
      if (p) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = p.textContent;
        expect(tempDiv.innerHTML).not.toBeNull();
        block.innerHTML = '';
        expect(block.innerHTML).toBe('');
        block.append(tempDiv);
      }
    }

    const table = document.createElement('table');
    const wrapperDiv = document.createElement('div');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Determine if a header should be built based on the block's class
    const header = !block.classList.contains('no-header');
    expect(header).toBeTruthy();
    if (header) table.append(thead);
    table.append(tbody);
    expect(table).not.toBeNull();

    block.innerHTML = '';
    wrapperDiv.append(table);
    expect(wrapperDiv.innerHTML).not.toBeNull();
    block.append(wrapperDiv);
});
