export type Media = 'portal' | 'relocation' | 'beer';
export function mediaFor(path: string): Media {
  if (path === '/beer' || path.startsWith('/beer/')) return 'beer';
  if (/^\/(relocation|niigata|hakodate)(\/|$)/.test(path)) return 'relocation';
  return 'portal';
}
export const mediaInfo = {
  portal: {
    name: 'Life Atlas',
    home: '/',
    note: '暮らしの選択に、手がかりを。',
  },
  relocation: {
    name: '地方移住',
    home: '/relocation/',
    note: '暮らす場所を考える',
  },
  beer: {
    name: 'Beer Atlas',
    home: '/beer/',
    note: 'ビールが美味しい店・認定店検索',
  },
};
export const navigation = {
  portal: [
    { label: 'About', note: 'Life Atlasについて', href: '/about/' },
    { label: '地方移住', note: '暮らす場所を考える', href: '/relocation/' },
    {
      label: 'ビールが美味しい店・認定店検索',
      note: 'Beer Atlas',
      href: '/beer/',
    },
    { label: 'Articles', note: '記事一覧', href: '/articles/' },
    { label: 'お問い合わせ', note: 'Contact', href: '/contact/' },
  ],
  relocation: [
    { label: '地方移住', note: '地域を選ぶ', href: '/relocation/' },
    { label: '新潟', note: '住まい・食・暮らし', href: '/niigata/' },
    { label: '函館', note: '街を知る', href: '/hakodate/' },
    {
      label: 'Articles',
      note: '地方移住の記事一覧',
      href: '/relocation/articles/',
    },
  ],
  beer: [
    {
      label: 'ビールが美味しい店・認定店検索',
      note: 'Beer Atlas',
      href: '/beer/',
    },
    { label: 'Articles', note: 'ビールの記事一覧', href: '/beer/articles/' },
    {
      label: '評価方針',
      note: '認定情報と編集部の評価について',
      href: '/beer/methodology/',
    },
  ],
};
