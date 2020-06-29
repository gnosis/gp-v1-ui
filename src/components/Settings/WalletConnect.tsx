import React from 'react'
import { FormContextValues, ErrorMessage, FieldErrors } from 'react-hook-form'
import styled from 'styled-components'
import { MEDIA } from 'const'

import Joi from '@hapi/joi'
import { Resolver, SettingsFormData } from 'pages/Settings'
import { WCOptions } from 'utils'

const URLSchema = Joi.string()
  .empty('')
  .optional()
  .uri({ scheme: ['http', 'https'] })
const BridgeSchema = URLSchema.message('Bridge must be a valid URL')
const RPCSchema = URLSchema.message('RPC must be a valid URL')
const InfuraIdSchema = Joi.string()
  .empty('')
  .optional()
  .length(32)
  .message('Must be a valid id')

const WCSettingsSchema = Joi.object({
  bridge: BridgeSchema,
  infuraId: InfuraIdSchema,
  rpc: Joi.object({
    mainnet: RPCSchema,
    rinkeby: RPCSchema,
  }).empty({
    mainnet: '',
    rinkeby: '',
  }),
})
  .oxor('infuraId', 'rpc')
  .messages({ 'object.oxor': 'InfuraId and RPC are mutually exclusive' })
// bridge is optional
// infuraId and rpc are optional and exclusive

// validates only walletconnect slice of form data
export const wcResolver: Resolver<SettingsFormData, 'walletconnect'> = (
  data: WCOptions,
): {
  values: WCOptions | null
  errors: FieldErrors<WCOptions> | null
  name: 'walletconnect'
} => {
  const result = WCSettingsSchema.validate(data, {
    abortEarly: false,
  })

  const { value: values, error } = result

  return {
    name: 'walletconnect',
    values: error ? null : values,
    errors: error
      ? error.details.reduce((previous, currentError) => {
          // when exlusive fields are both present
          if (currentError.path.length === 0 && currentError.type === 'object.oxor') {
            return {
              ...previous,
              infuraId: currentError,
              rpc: currentError,
            }
          }
          // any other error
          return {
            ...previous,
            [currentError.path[0]]: currentError,
          }
        }, {})
      : null,
  }
}

interface WCSettingsProps {
  register: FormContextValues['register']
  errors: FieldErrors<SettingsFormData>
}

const OuterFormSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.5em;

  > div {
    margin: 0.5em 0;
  }
`

const AlternativesSection = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;

  @media ${MEDIA.mobile} {
    grid-template-rows: 1fr auto 1fr;
    grid-template-columns: auto;
  }
`

const OrSeparator = styled.div`
  padding: 0.5em;
    font-size: 0.8em;
    display: flex;
    justify-content: center;
    align-items: center;
}
`

const ErrorWrapper = styled.p`
  color: var(--color-error);
  margin: 0;
  padding: 0.5em;
  font-size: 0.7em;
`

const InnerFormSection = styled.div`
  padding: 0.5em;
  padding-bottom: 1em;
  box-shadow: 0 0 7px 0px grey;
  border-radius: 0.5rem;
  background: var(--color-background);
  position: relative;

  ${ErrorWrapper} {
    position: absolute;
    bottom: 0;
  }
`

const FormField = styled.label`
  display: flex;
  flex-direction: column;

  > span {
    font-weight: bold;
  }

  > input {
    width: auto;
    font-size: 1em;
    font-weight: normal;

    ::placeholder {
      opacity: 0.2;
    }
  }
`

const Disclaimer = styled.div`
  display: flex;
  justify-content: center;

  > p {
    font-size: 1.4em;
    max-width: 600px;
    width: 100%;
    padding: 0.5em;
    border-radius: 0.8rem;
  }
`

export const WCSettings: React.FC<WCSettingsProps> = ({ register, errors }) => {
  return (
    <div>
      <Disclaimer>
        <p>
          Here you can set InfuraId or RPC URl that will be used for connecting WalletConnect provider to mainnet. It is
          also possible to set WalletConnect bridge URL to use instead of the default one
        </p>
      </Disclaimer>
      <OuterFormSection>
        <AlternativesSection>
          <InnerFormSection>
            <FormField>
              <span>IfuraId</span>
              <input type="text" name="walletconnect.infuraId" ref={register} />
            </FormField>
            <WCError errors={errors} name="infuraId" />
          </InnerFormSection>
          <OrSeparator>
            <span>OR</span>
          </OrSeparator>
          <InnerFormSection>
            <FormField>
              <span>RPC URL</span>
              <input
                type="text"
                name="walletconnect.rpc.mainnet"
                ref={register}
                placeholder="MAINNET: https://mainnet.node_url"
              />
              <input
                type="text"
                name="walletconnect.rpc.rinkeby"
                ref={register}
                placeholder="RINKEBY: https://rinkeby.node_url"
              />
            </FormField>
            <WCError errors={errors} name="rpc" />
          </InnerFormSection>
        </AlternativesSection>

        <InnerFormSection>
          <FormField>
            <span>Bridge URL</span>
            <input
              type="text"
              name="walletconnect.bridge"
              ref={register}
              placeholder="https://bridge.walletconnect.org"
            />
          </FormField>
          <WCError errors={errors} name="bridge" />
        </InnerFormSection>
      </OuterFormSection>
    </div>
  )
}

interface WCErrorsProps {
  errors: FieldErrors<SettingsFormData>
  name: string
}

const WCError: React.FC<WCErrorsProps> = ({ errors, name }) => {
  return (
    <ErrorWrapper>
      <ErrorMessage errors={errors} name={'walletconnect.' + name} />
    </ErrorWrapper>
  )
}
