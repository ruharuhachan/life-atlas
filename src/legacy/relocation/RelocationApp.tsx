import { sitePath } from '../site-path';

const CHECKS = [
  {
    no: '01',
    label: 'WORK & INCOME',
    title: '仕事と収入',
    question: '転職するか、今の仕事を持っていくか。',
    check: '手取り、出社頻度、テレワーク規程、副業可否、東京出張費を確認。',
  },
  {
    no: '02',
    label: 'MOBILITY',
    title: '車と日常移動',
    question: '車なしで暮らせるか、ではなく許容できるか。',
    check: '雨雪の日、最終バス、駐車場代、家族の送迎を含めて試算。',
  },
  {
    no: '03',
    label: 'WINTER',
    title: '冬・風・濡れ',
    question: '積雪量だけを見て決めていないか。',
    check: '入口から駅までの路面、風、除雪、室内の断熱と結露を現地確認。',
  },
  {
    no: '04',
    label: 'HOUSING',
    title: '住居費と建物',
    question: '購入価格だけで比較していないか。',
    check: '管理費、修繕積立金、駐車場、暖房費、将来修繕まで月額化。',
  },
  {
    no: '05',
    label: 'HAZARD',
    title: '水・地盤・避難',
    question: '洪水、内水、津波、液状化を分けて見たか。',
    check: '住所単位の想定と避難先までの実際の動線を確認。',
  },
  {
    no: '06',
    label: 'CARE',
    title: '医療・子育て',
    question: '家族に必要な機能へ何分で着けるか。',
    check: 'かかりつけ候補、夜間診療、保育・学校、親の支援距離を確認。',
  },
  {
    no: '07',
    label: 'TOKYO ACCESS',
    title: '都会との距離',
    question: '新幹線の所要時間だけで考えていないか。',
    check: '自宅から駅、待ち時間、終電、年間往復回数まで総コスト化。',
  },
  {
    no: '08',
    label: 'COMMUNITY',
    title: '人との接点',
    question: '家と仕事以外の居場所があるか。',
    check: '店、趣味、地域活動、相談先など、移住後の接点を先につくる。',
  },
];

const SUPPORTS = [
  {
    no: '01',
    tag: 'TOKYO 23 WARDS',
    title: '新潟市移住支援金',
    amount: '単身 60万円',
    amount2: '2人以上 100万円',
    add: '18歳未満の世帯員1人につき100万円加算の対象あり',
    forWhom:
      '東京23区に在住していた人、または東京圏から23区へ通勤していた人など。直前10年のうち通算5年以上、直前に連続1年以上という居住・通勤要件があります。',
    work: '就業、専門人材、起業、テレワーク、関係人口のいずれかの仕事要件も必要です。',
    timing:
      '原則、転入後1年以内かつ各年度2月末まで。予算上限で早期終了する場合があります。',
    url: 'https://iju.niigata.jp/ijushienkin/',
  },
  {
    no: '02',
    tag: 'REMOTE WORK',
    title: '移住促進特別支援金',
    amount: '単身 30万円',
    amount2: '2人以上 50万円',
    add: '三大都市圏から、今の仕事を続けてテレワーク移住',
    forWhom:
      '東京・名古屋・大阪の三大都市圏に直前1年以上在住し、自分の意思で移住する人。',
    work: '移住元の業務を1年以上継続し、週20時間以上テレワークするなどの要件があります。',
    timing:
      '転入後6か月以内かつ各年度3月15日まで。予算に達すると早期終了する場合があります。',
    url: 'https://iju.niigata.jp/ijusokushintokubetu/',
  },
  {
    no: '03',
    tag: 'FAMILY',
    title: '子育て世帯移住支援金',
    amount: '一世帯 50万円',
    amount2: '',
    add: '18歳未満の子を帯同して東京圏から移住',
    forWhom:
      '東京圏の条件不利地域以外に直前10年のうち通算5年以上、直前に連続1年以上在住していた子育て世帯など。',
    work: '就業、専門人材、起業、テレワーク、関係人口のいずれかの要件があります。',
    timing:
      '転入後1年以内かつ各年度2月末まで。原則5年以上の継続居住意思が必要です。',
    url: 'https://iju.niigata.jp/kosodatesetaiijusienkin/',
  },
  {
    no: '04',
    tag: 'TRIAL STAY',
    title: 'テレワーク体験居住',
    amount: '単身 3万円',
    amount2: '2人以上 5万円',
    add: '新潟市で1週間以上、テレワークしながら生活を試す',
    forWhom: '三大都市圏に直前1年以上在住し、所属先などの業務を継続する人。',
    work: '体験居住を始める3日前までの事前申込が必要。同一年度内の申請は2回までです。',
    timing:
      '観光ではなく普通の日を試す制度。宿泊予約前に公式要件を確認してください。',
    url: 'https://iju.niigata.jp/ijusokushintokubetu/',
  },
  {
    no: '05',
    tag: 'VACANT HOUSE',
    title: '空き家活用推進事業',
    amount: '購入 最大100万円',
    amount2: '改修 最大100万円',
    add: '購入とリフォームを合わせる場合は最大200万円',
    forWhom:
      '県外から新潟市へ移住し、居住用の空き家を購入・リフォームする人など。',
    work: '購入費・改修費の2分の1が上限。対象となる空き家や継続居住などの個別要件があります。',
    timing:
      '交付決定前に購入代金の支払いや工事へ着手すると原則対象外です。必ず契約・着手前に相談してください。',
    url: 'https://www.city.niigata.lg.jp/kurashi/jyutaku/jukankyo/yushi_josei/akiyakatsuyo.html',
  },
];

export default function RelocationPage() {
  return (
    <div className="relocation-page">
      <section className="relocation-hero" id="top">
        <div className="relocation-hero-copy">
          <p className="database-breadcrumb">
            <a href={sitePath('/')}>移住トップ</a>
            <span>/</span>移住準備・支援制度
          </p>
          <div className="relocation-overline">
            <span>FOR I-TURN / U-TURN FROM THE CITY</span>
            <b>2026 EDITION</b>
          </div>
          <h1>
            移住の前に、
            <br />
            <em>順番</em>を決める。
          </h1>
          <p>
            新潟が好きかだけでなく、都会で維持したいものと、新潟で変えたいものを分ける。仕事・住まい・移動・冬・制度を、契約前のチェックリストにします。
          </p>
          <div className="relocation-hero-actions">
            <a className="button button-primary" href="#checks">
              8つの論点を見る
            </a>
            <a className="button button-ghost" href="#support">
              使える制度を探す
            </a>
          </div>
        </div>
        <aside className="relocation-hero-board" aria-label="移住準備の順番">
          <div className="relocation-board-title">
            <span>DECISION ORDER</span>
            <strong>04</strong>
          </div>
          <a href="#checks">
            <span>01</span>
            <b>条件を分ける</b>
            <small>希望 / 固定 / 妥協可能</small>
          </a>
          <a href="#steps">
            <span>02</span>
            <b>普通の日を試す</b>
            <small>通勤 / 雨雪 / 買い物</small>
          </a>
          <a href="#support">
            <span>03</span>
            <b>制度へ事前相談</b>
            <small>転入・契約の前に</small>
          </a>
          <a href={sitePath('/housing')}>
            <span>04</span>
            <b>住まいを比較する</b>
            <small>価格 / 固定費 / ハザード</small>
          </a>
          <p>
            支援制度は「あとでもらえるお金」ではなく、動く順番を左右する条件です。
          </p>
        </aside>
      </section>

      <section className="relocation-checks" id="checks">
        <div className="relocation-section-heading">
          <div>
            <p className="kicker">REALITY CHECK / 01</p>
            <h2>
              移住前に考える、
              <br />
              8つのこと。
            </h2>
          </div>
          <p>
            魅力を否定するためではなく、移住後の「思っていたのと違う」を減らすための観測項目です。
          </p>
        </div>
        <div className="relocation-check-grid">
          {CHECKS.map((item) => (
            <article key={item.no}>
              <div>
                <span>{item.no}</span>
                <small>{item.label}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.question}</p>
              <b>{item.check}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="support-section" id="support">
        <div className="support-heading">
          <div>
            <p className="kicker">OFFICIAL SUPPORT FINDER / 02</p>
            <h2>
              条件から、
              <br />
              制度の入口を探す。
            </h2>
          </div>
          <div>
            <p>
              令和8年度（2026年度）の新潟市・新潟県の公式情報を、都市部からの移住者向けに要約しています。
            </p>
            <small>最終確認：2026年8月16日</small>
          </div>
        </div>

        <div className="support-alert">
          <span>CHECK BEFORE MOVING</span>
          <p>
            <b>まず新潟市へ相談してから動く。</b>
            制度ごとに移住元、仕事、世帯、申請期限が異なります。移住支援金・テレワーク移住・子育て世帯移住支援金は併給できません。
          </p>
        </div>

        <div className="support-card-list">
          {SUPPORTS.map((support) => (
            <article className="support-card" key={support.no}>
              <div className="support-card-index">
                <span>{support.no}</span>
                <small>{support.tag}</small>
              </div>
              <div className="support-card-main">
                <h3>{support.title}</h3>
                <div className="support-amount">
                  <strong>{support.amount}</strong>
                  {support.amount2 && <strong>{support.amount2}</strong>}
                </div>
                <p className="support-add">{support.add}</p>
              </div>
              <div className="support-card-detail">
                <div>
                  <span>対象の入口</span>
                  <p>{support.forWhom}</p>
                </div>
                <div>
                  <span>仕事・対象要件</span>
                  <p>{support.work}</p>
                </div>
                <div>
                  <span>期限・注意</span>
                  <p>{support.timing}</p>
                </div>
                <a href={support.url} target="_blank" rel="noreferrer">
                  公式ページで全要件を確認 ↗
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="support-disclaimer">
          掲載金額は交付を保証するものではありません。予算、受付状況、移住日、勤務形態、世帯構成などで対象可否が変わります。申請前は必ず新潟市経済部
          雇用・新潟暮らし推進課（025-226-2149）または各制度の担当窓口へ確認してください。
        </p>
      </section>

      <section className="relocation-steps" id="steps">
        <div className="relocation-section-heading light-relocation-heading">
          <div>
            <p className="kicker">ACTION PLAN / 03</p>
            <h2>
              契約より先に、
              <br />
              証明と相談を。
            </h2>
          </div>
          <p>
            制度が使えなくなる典型は、要件を確認する前に転入・契約・工事を進めてしまうことです。
          </p>
        </div>
        <div className="relocation-step-grid">
          <article>
            <span>01 / まだ都会にいる</span>
            <h3>居住歴と働き方を確認</h3>
            <ul>
              <li>直前10年の住所履歴を整理する</li>
              <li>東京23区への通勤期間を確認する</li>
              <li>会社のテレワーク規程と就業証明を確認する</li>
              <li>新潟市の相談窓口へ候補制度を事前相談する</li>
            </ul>
          </article>
          <article>
            <span>02 / 新潟で試す</span>
            <h3>普通の平日を観測</h3>
            <ul>
              <li>1週間以上の体験居住制度を確認する</li>
              <li>朝夕・雨・風の移動を試す</li>
              <li>スーパー、病院、職場候補まで移動する</li>
              <li>候補物件と避難先を歩いて確認する</li>
            </ul>
          </article>
          <article>
            <span>03 / 契約・転入の前</span>
            <h3>順番と締切を確定</h3>
            <ul>
              <li>制度間の併給可否を確認する</li>
              <li>空き家は交付決定前に着手しない</li>
              <li>転出元で必要な証明の取得方法を確認する</li>
              <li>年度末と予算終了を見込んで余裕を持つ</li>
            </ul>
          </article>
          <article>
            <span>04 / 転入した後</span>
            <h3>期限内に申請・保存</h3>
            <ul>
              <li>住民票除票や就業証明などを揃える</li>
              <li>6か月・1年など制度別期限を管理する</li>
              <li>申請控えと要件証跡を保存する</li>
              <li>継続居住・就業に伴う返還条件も把握する</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="relocation-sources">
        <div>
          <p className="kicker">PRIMARY SOURCES / 04</p>
          <h2>
            更新は、
            <br />
            公式情報へ戻る。
          </h2>
        </div>
        <div className="relocation-source-list">
          <a
            href="https://iju.niigata.jp/ijushienkin/"
            target="_blank"
            rel="noreferrer"
          >
            <span>01</span>
            <b>新潟市移住支援金</b>
            <small>東京23区等からの移住</small>
          </a>
          <a
            href="https://iju.niigata.jp/ijusokushintokubetu/"
            target="_blank"
            rel="noreferrer"
          >
            <span>02</span>
            <b>移住促進特別支援事業</b>
            <small>テレワーク移住・体験居住</small>
          </a>
          <a
            href="https://iju.niigata.jp/kosodatesetaiijusienkin/"
            target="_blank"
            rel="noreferrer"
          >
            <span>03</span>
            <b>子育て世帯移住支援金</b>
            <small>東京圏からの子育て世帯</small>
          </a>
          <a
            href="https://www.city.niigata.lg.jp/kurashi/jyutaku/jukankyo/yushi_josei/akiyakatsuyo.html"
            target="_blank"
            rel="noreferrer"
          >
            <span>04</span>
            <b>空き家活用推進事業</b>
            <small>購入・リフォーム</small>
          </a>
          <a
            href="https://www.pref.niigata.lg.jp/sec/shigototeijyu/uisiensaku-2026.html"
            target="_blank"
            rel="noreferrer"
          >
            <span>05</span>
            <b>令和8年度 U・Iターン支援策一覧</b>
            <small>県・市町村の制度横断</small>
          </a>
          <a
            href="https://www.city.niigata.lg.jp/kurashi/jyutaku/jukankyo/yushi_josei/sumaijosei.html"
            target="_blank"
            rel="noreferrer"
          >
            <span>06</span>
            <b>住まいの融資・助成一覧</b>
            <small>住宅関連制度</small>
          </a>
        </div>
      </section>
    </div>
  );
}
