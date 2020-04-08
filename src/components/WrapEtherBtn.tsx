import React, { useMemo } from 'react'
import styled from 'styled-components'
import { DEFAULT_MODAL_OPTIONS, ModalBodyWrapper } from 'components/Modal'
import Modali, { useModali } from 'modali'
import { InputBox } from 'components/InputBox'
import { useForm } from 'react-hook-form'
import { DEFAULT_PRECISION, formatAmountFull } from '@gnosis.pm/dex-js'
import BN from 'bn.js'
import { validatePositiveConstructor, validInputPattern } from 'utils'
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
          color: #476481;
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
      color: red;
    }

    b {
      font-size: 1.3rem;
      color: #2f3e4e;
      margin: 0 1.6rem 0 0;
      margin-bottom: 0.5rem;
      padding-left: -0.5;
      display: block;
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
  tooltipText: JSX.Element | string
  description: JSX.Element
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
        Gnosis Protocol allows to exchange any ERC20 token, but since ETH is not an ERC20, it needs to be wrapped first.
      </p>
      <p>
        Wrapping is sending your ether into the WETH contract. That would mint the same amount of WETH as ETH you send
        to it.
      </p>
      <p>You can exchange back ETH for WETH any time, this is called Unwrapping WETH.</p>
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
        Wrap converts ETH into WETH,
        <br />
        so it can be deposited into the exchange)
      </div>
    )

    // TODO: Get ETH balance
    const balance = new BN('1234567800000000000')

    return {
      title: 'Wrap Ether',
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
          Unwrap converts back WETH into ETH.{' '}
          {!wethHelpVisible && <a onClick={(): void => showWethHelp(true)}>Learn more...</a>}
        </p>
        {wethHelpVisible && WethHelp}
      </>
    )
    // TODO: Get WETH balance
    const balance = new BN('1234567800000000000')

    return {
      title: 'Unwrap Ether',
      amountLabel: 'Amount to Wrap',
      symbolSource: 'WETH',
      balance,
      description,
      tooltipText: 'Unwrap converts back WETH into ETH',
    }
  }
}

const WrapUnwrapEtherBtn: React.FC<WrapUnwrapEtherBtnProps> = (props: WrapUnwrapEtherBtnProps) => {
  const { wrap, label, className } = props
  const [wethHelpVisible, showWethHelp] = useSafeState(false)
  const { register, errors, handleSubmit, setValue /* watch, triggerValidation */ } = useForm({
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

  const onSubmit = (data: FormData): void => {
    console.debug('data', data)
    // OnSubmit<FieldValues>
    alert('on submit 1')
    // if (event) {
    //   alert('on submit 2')
    //   console.log('Stop propagation')
    //   event.preventDefault()
    //   event.stopPropagation()
    // }
    alert('on submit 4')
    console.log('HANDLE SUBMITTT!!!', data)
  }

  // const handleSubmit = (event: BaseSyntheticEvent): void => {
  //   alert('A name was submitted')
  //   event.preventDefault()
  // }

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
        {/* <form ref={formRef} onSubmit={handleSubmit}></form> */}
      </ModalWrapper>
    ),
    buttons: [
      <Modali.Button label="Cancel" key="no" isStyleCancel onClick={(): void => toggleModal()} />,
      <Modali.Button label="Continue" key="yes" isStyleDefault onClick={handleSubmit(onSubmit)} />,
    ],
  })

  return (
    <>
      <TooltipWrapper as="button" type="button" className={className} onClick={toggleModal} tooltip={tooltipText}>
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
