import React, { useMemo } from 'react'
import styled from 'styled-components'
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'
import Modali, { useModali } from 'modali'
import { InputBox } from 'components/InputBox'
import { useForm } from 'react-hook-form'
import { DEFAULT_PRECISION, formatAmountFull } from '@gnosis.pm/dex-js'
import BN from 'bn.js'
import { validatePositiveConstructor, validInputPattern, logDebug } from 'utils'
import { TooltipWrapper } from 'components/Tooltip'
import useSafeState from 'hooks/useSafeState'

export const INPUT_ID_AMOUNT = 'wrapAmount'

const ModalWrapper = styled(ModalBodyWrapper)`
  > form {
    > div {
      margin: 3rem 1.5rem;

      ${InputBox} {
        position: relative;
        display: flex;
        flex-flow: row wrap;

        i {
          position: absolute;
          right: 1rem;
          top: 0;
          bottom: 0;
          margin: 0;
          color: var(--color-svg-switcher);
          letter-spacing: -0.05rem;
          text-align: right;
          font-family: var(--font-default);
          font-weight: var(--font-weight-bold);
          font-size: 1.2rem;
          font-style: normal;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }

    .error {
      color: var(--color-error);
    }

    > b {
      display: block;
      margin: 0 1.6rem 0 0;
      margin-bottom: 0.5rem;
      padding-left: -0.5;
      font-size: 1.3rem;
      color: : var(--color-background-modali);
    }

    b {
      
      
            
    }

    a {
      color: rgb(33, 141, 255);
    }

    p a {
      font-size: 1.2rem;
      margin-left: 0.2rem;
    }

    .more-info {
      font-size: 1.3rem;
      background: var(--color-background-validation-warning);
      padding: 0.1rem 1rem;
      margin: 1rem 0 0.25rem;
    }
  }
`

interface WrapUnwrapEtherBtnProps {
  wrap: boolean
  label?: string
  className?: string
}

export type WrapEtherBtnProps = Omit<WrapUnwrapEtherBtnProps, 'wrap'>

interface WrapUnwrapInfo {
  title: string
  symbolSource: string
  balance: BN
  tooltipText: React.ReactNode | string
  description: React.ReactNode
  amountLabel: string
}

function getModalParams(
  wrap: boolean,
  wethHelpVisible: boolean,
  showWethHelp: React.Dispatch<React.SetStateAction<boolean>>,
): WrapUnwrapInfo {
  const WethHelp = (
    <div className="more-info">
      <p>
        Gnosis Protocol allows the exchange of any ERC20 token. As ETH is not an ERC20 token, it must first be wrapped.
      </p>
      <p>By wrapping ETH you will be minting your submitted amount as WETH.</p>
      <p>
        ETH can be <b>wrapped</b> as WETH anytime. Equally, WETH can be <b>unwrapped</b> back into ETH
      </p>
      <p>
        Learn more about WETH{' '}
        <a target="_blank" rel="noopener noreferrer" href="https://weth.io/">
          weth.io
        </a>
      </p>
    </div>
  )

  if (wrap) {
    // TODO: Get ETH balance
    const description = (
      <>
        <p>
          Wrap ETH into WETH, so it can later be deposited into the exchange. {wethHelpVisible && WethHelp}
          <a onClick={(): void => showWethHelp(!wethHelpVisible)}>
            {wethHelpVisible ? '[-] Show less...' : '[+] Show more...'}
          </a>
        </p>
      </>
    )
    const tooltipText = (
      <div>
        Wrapping converts ETH into WETH,
        <br />
        so it can be deposited into the exchange)
      </div>
    )

    // TODO: Get ETH balance
    const balance = new BN('1234567800000000000')

    return {
      title: 'Wrap ETH',
      amountLabel: 'Amount to Wrap',
      symbolSource: 'ETH',
      balance,
      description,
      tooltipText,
    }
  } else {
    const description = (
      <>
        <p>
          Unwrapping converts WETH back into ETH.{' '}
          {!wethHelpVisible && <a onClick={(): void => showWethHelp(true)}>Learn more...</a>}
        </p>
        {wethHelpVisible && WethHelp}
      </>
    )
    // TODO: Get WETH balance
    const balance = new BN('1234567800000000000')

    return {
      title: 'Unwrap WETH',
      amountLabel: 'Amount to Unwrap',
      symbolSource: 'WETH',
      balance,
      description,
      tooltipText: 'Unwrapping converts WETH back into ETH',
    }
  }
}

interface WrapEtherFormData {
  [INPUT_ID_AMOUNT]: string
}

const WrapUnwrapEtherBtn: React.FC<WrapUnwrapEtherBtnProps> = (props: WrapUnwrapEtherBtnProps) => {
  const { wrap, label, className } = props
  const [wethHelpVisible, showWethHelp] = useSafeState(false)
  const { register, errors, handleSubmit, setValue } = useForm<WrapEtherFormData>({
    mode: 'onChange',
  })
  // const formRef = useRef<HTMLFormElement | null>(null)
  // const amountValue = watch(INPUT_ID_AMOUNT)
  const amountError = errors[INPUT_ID_AMOUNT]

  // console.log('amountValue', amountValue)

  const { title, balance, symbolSource, tooltipText, description, amountLabel } = useMemo(
    () => getModalParams(wrap, wethHelpVisible, showWethHelp),
    [wrap, wethHelpVisible, showWethHelp],
  )

  const [modalHook, toggleModal] = useModali({
    ...DEFAULT_MODAL_OPTIONS,
    title,
    message: (
      <ModalWrapper>
        <form>
          <div>
            {description}
            <b>Available {symbolSource}</b>
            <div>
              <a onClick={(): void => setValue(INPUT_ID_AMOUNT, formatAmountFull(balance), true)}>
                {formatAmountFull({ amount: balance, precision: DEFAULT_PRECISION }) || ''} {symbolSource}
              </a>
            </div>
          </div>
          <div>
            <b>{amountLabel}</b>
            <div>
              <InputBox>
                <i>{symbolSource}</i>
                <input
                  type="text"
                  name={INPUT_ID_AMOUNT}
                  placeholder="0"
                  required
                  ref={register({
                    pattern: { value: validInputPattern, message: 'Invalid amount' },
                    validate: { positive: validatePositiveConstructor('Invalid amount') },
                    required: 'The amount is required',
                    min: 0,
                  })}
                />
              </InputBox>
            </div>
            {amountError && <p className="error">Invalid amount</p>}
          </div>
        </form>
      </ModalWrapper>
    ),
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => modalHook.hide()} />,
      <Modali.Button
        label="Continue"
        key="yes"
        isStyleDefault
        onClick={handleSubmit((data: WrapEtherFormData): void => {
          const { wrapAmount } = data
          if (wrap) {
            logDebug(`[WrapEtherBtn] Wrap ${wrapAmount} ETH!`)
            alert(`[WrapEtherBtn] Wrap ${wrapAmount} ETH!`) // TODO: Do real thing
          } else {
            logDebug(`[WrapEtherBtn] Unwrap ${wrapAmount} ETH!`)
            alert(`[WrapEtherBtn] Unwrap ${wrapAmount} ETH!`) // TODO: Do real thing
          }
          modalHook.hide()
        })}
      />,
    ],
  })

  return (
    <>
      <TooltipWrapper
        as="button"
        type="button"
        // className={className}
        className={className ? 'not-implemented ' + className : 'not-implemented'}
        onClick={toggleModal}
        tooltip={tooltipText}
      >
        {label || title}
      </TooltipWrapper>
      <Modali.Modal {...modalHook} />
    </>
  )
}

export const WrapEtherBtn: React.FC<WrapEtherBtnProps> = (props: WrapEtherBtnProps) => (
  <WrapUnwrapEtherBtn wrap={true} {...props} />
)

export const UnwrapEtherBtn: React.FC<WrapEtherBtnProps> = (props: WrapEtherBtnProps) => (
  <WrapUnwrapEtherBtn wrap={false} {...props} />
)
