beforeEach(() => {
  // Set up the mocked HTML block
  document.body.innerHTML = `<div id="tabs-test" class="tabs block" data-block-name="tabs" data-block-status="loading">
                                       <div>
                                         <div><p>Tab 1</p></div>
                                         <div>
                                           <p>Tab content 1</p>
                                           <p>adsfadsf</p>
                                           <p>asfdfsda</p>
                                         </div>
                                       </div>
                                       <div>
                                         <div><p>Tab 2</p></div>
                                         <div>
                                           <p>Tab content 2</p>
                                           <p>sadfkasdjofi</p>
                                           <p>adsfjndfosn</p>
                                           <p>asdjonfasiodf</p>
                                           <p>adsfokmadfs</p>
                                         </div>
                                       </div>
                                     </div>`;
});

test('decorates correctly tabs block', () => {
  const block = document.getElementById('tabs-test');

  const tabList = document.createElement('div');
    tabList.className = 'tabs-list';
    tabList.setAttribute('role', 'tablist');

    expect(tabList.classList).toContain('tabs-list');
    expect(tabList.attributes.getNamedItem('role')).not.toBeNull();

    const tabs = [...block.children].map((child) => child.firstElementChild);
    expect(tabs).not.toBeNull();
    tabs.forEach((tab, i) => {
      const tabPanel = block.children[i];
      tabPanel.className = 'tabs-panel';
      tabPanel.id = `tabpanel-${i}`;
      tabPanel.setAttribute('aria-hidden', !!i);
      tabPanel.setAttribute('aria-labelledby', `tab-${i}`);
      tabPanel.setAttribute('role', 'tabpanel');
      expect(tabPanel).not.toBeNull();

      const button = document.createElement('button');
      button.className = 'tabs-tab';
      button.id = `tab-${i}`;
      button.innerHTML = tab.innerHTML;
      button.setAttribute('aria-controls', `tabpanel-${i}`);
      button.setAttribute('aria-selected', !i);
      button.setAttribute('role', 'tab');
      button.setAttribute('type', 'button');
      expect(button.id).not.toBeNull();
      expect(button.classList).toContain('tabs-tab');

      button.addEventListener('click', () => {
        block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
          panel.setAttribute('aria-hidden', 'true');
        });
        tabList.querySelectorAll('button').forEach((btn) => {
          btn.setAttribute('aria-selected', 'false');
        });
        tabPanel.setAttribute('aria-hidden', 'false');
        button.setAttribute('aria-selected', 'true');
      });
      tabList.append(button);
      tab.remove();
    });

    block.prepend(tabList);
});
