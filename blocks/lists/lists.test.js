beforeEach(() => {
    document.body.innerHTML = `<div class="list-wrapper">
                                    <div class="list description block">
                                        <ul id="list-1">
                                            <li>
                                                <span class="list-item-content">
                                                    <span class="list-item-title">bowl</span>
                                                    <span class="list-item-separator"></span>
                                                    <span class="list-item-description">high</span>
                                                </span>
                                            </li>
                                            <li>
                                                <span class="list-item-content">
                                                    <span class="list-item-title">hello</span>
                                                    <span class="list-item-separator"></span>
                                                    <span class="list-item-description">world</span>
                                                </span>
                                            </li>
                                            <li>
                                                <span class="list-item-content">
                                                    <span class="list-item-title">
                                                         <a href="https://example.com">example link</a>
                                                    </span>
                                                    <span class="list-item-separator"></span>
                                                    <span class="list-item-description">y</span>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="list-wrapper">
                                    <div class="list title block">
                                        <ul id="list-2">
                                            <li>
                                                <span class="list-item-content">
                                                    <span class="list-item-title">another link</span>
                                                    <span class="list-item-separator"></span>
                                                    <span class="list-item-description">example</span>
                                                </span>
                                            </li>
                                            <li>
                                                <span class="list-item-content">
                                                    <span class="list-item-title">
                                                        <a href="https://example.org">apple</a>
                                                    </span>
                                                    <span class="list-item-separator"></span>
                                                    <span class="list-item-description">fruit</span>
                                                </span>
                                            </li>
                                            <li>
                                                <span class="list-item-content">
                                                    <span class="list-item-title">coffee</span>
                                                    <span class="list-item-separator"></span>
                                                    <span class="list-item-description">beverage</span>
                                                </span>
                                            </li>
                                            <li>
                                                <span class="list-item-content">
                                                    <span class="list-item-title">zebra</span>
                                                    <span class="list-item-separator"></span>
                                                    <span class="list-item-description">animal</span>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>`;
});


test('check if each list item has a title and description', () => {
    const listItems = document.querySelectorAll('.list-item-content');

    listItems.forEach(item => {
        const title = item.querySelector('.list-item-title');
        const description = item.querySelector('.list-item-description');

        expect(title).not.toBeNull();
        expect(description).not.toBeNull();

        //check if the title and description are not empty
        expect(title.textContent.trim()).not.toBe('');
        expect(description.textContent.trim()).not.toBe('');
    });
});

test('check if list items are sorted correctly based on orderBy value', () => {
    // test for the first list (ordered by description)
    const descriptionList = document.querySelector('.list.description ul');
    const descriptionItems = descriptionList.querySelectorAll('li .list-item-content');

    //extract the values of the descriptions
    const descriptions = Array.from(descriptionItems).map(item =>
        item.querySelector('.list-item-description').textContent.trim()
    );

    // check if the descriptions are in ascending order
    const sortedDescriptions = [...descriptions].sort((a, b) => a.localeCompare(b));
    expect(descriptions).toEqual(sortedDescriptions);

    // test for the second list (ordered by title)
    const titleList = document.querySelector('.list.title ul');
    const titleItems = titleList.querySelectorAll('li .list-item-content');

    // extract the values of the titles
    const titles = Array.from(titleItems).map(item => {
        const titleElement = item.querySelector('.list-item-title');
        return titleElement.textContent.trim();
    });

    // check if the titles are in ascending order
    const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sortedTitles);
});
