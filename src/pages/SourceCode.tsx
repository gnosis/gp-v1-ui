import * as React from 'react'

interface Link {
  label: string
  src: string
}

const links: Link[] = [
  {
    label: 'Smart Contracts',
    src: 'https://github.com/gnosis/dex-contracts',
  },
  {
    label: 'Services',
    src: 'https://github.com/gnosis/dex-services',
  },
  {
    label: 'Research',
    src: 'https://github.com/gnosis/dex-research',
  },
  {
    label: 'Telegram',
    src: 'https://github.com/gnosis/dex-telegram',
  },
]

const SourceCode: React.FC = () => (
  <>
    <h1>Source code</h1>
    <p>dFusion is an Open Protocol, build on top of Ethereum</p>
    <ul>
      {links.map(link => (
        <li key={link.src}>
          <strong>{link.label}</strong>:&nbsp;
          <a href={link.src} target="_blank" rel="noreferrer noopener">
            {link.src}
          </a>
        </li>
      ))}
    </ul>
  </>
)

export default SourceCode
