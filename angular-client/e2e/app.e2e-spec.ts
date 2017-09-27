import { Ang2ProjPage } from './app.po';

describe('ang2-proj App', function() {
  let page: Ang2ProjPage;

  beforeEach(() => {
    page = new Ang2ProjPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
