import styled from 'styled-components'

export const DynamicWrapper = styled.div<{ responsive: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  ${(props): string =>
    props.responsive &&
    `
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: #000000b5;
    `}
`

export const InnerWrapper = styled.div`
  position: relative;
  background-color: #f7f0ff;
  border-bottom: 2px solid #0000000f;
  border-radius: 20px;
  width: 96%;

  > div {
    margin-top: 2rem;
  }

  span.symbol {
    color: #b02ace;
  }

  h4 {
    margin: 3rem 1rem 1rem;
    font-size: 1.3em;
    text-align: center;
  }

  ul {
    align-items: center;
    list-style: none;
    text-align: left;
    margin: auto;
    padding: 1rem 0 1rem 3rem;
    max-width: 364px;

    @media only screen and (max-width: 420px) {
      padding: 1rem 0;
    }

    li {
      display: block;
      margin: 0 auto;
    }

    li > label {
      width: 9em;
      color: #6c0084;
      font-weight: bold;
      text-align: right;
    }

    p.error {
      color: red;
      padding: 0 0 0.5em 10em;
      margin: 0;
    }

    div.wallet {
      display: inline-block;
      text-align: center;
      position: relative;

      a.max {
        display: inline-block;
        margin-left: 0.5em;
        position: absolute;
        top: 1.3em;
        right: -3em;
      }
    }

    li > label {
      display: block;
      height: 100%;
    }

    .buttons {
      text-align: center;
      padding-top: 1em;
      button {
        min-width: 7em;
        margin-left: 1.2em;
      }
    }
  }

  .times {
    position: absolute;
    top: 0;
    right: 0;
    text-decoration: none;
    font-size: 2em;
    display: inline-block;
    padding: 0 0.5em 0 0;
  }
`
