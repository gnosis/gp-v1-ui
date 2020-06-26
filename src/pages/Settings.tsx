import React, { useState } from 'react'
import { useForm, FormContextValues, ValidationResolver, ErrorMessage, FieldErrors } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import styled from 'styled-components'
import { MEDIA } from 'const'

import Joi from '@hapi/joi'
import { walletApi } from 'api'
import { setCustomWCOptions, getWCOptionsFromStorage, WCOptions } from 'utils'

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

interface WCSettingsProps {
  register: FormContextValues['register']
  errors: FieldErrors<SettingsFormData>
}

const OuterFormSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.5em;

  > div {
    margin: 0.5em;
  }
`

const AlternativesSection = styled.div`
  display: grid;
  outline: dotted;
  grid-template-columns: 1fr auto 1fr;

  @media ${MEDIA.mobile} {
    grid-template-rows: 1fr auto 1fr;
    grid-template-columns: auto;
  }
`

const OrSeparator = styled.div`
  padding: 0.5em;
  text-align: center;
  font-size: 0.8em;
`

const ErrorWrapper = styled.p`
  color: var(--color-error);
  margin: 0;
  padding: 0.5em;
  font-size: 0.7em;
`

const InnerFormSection = styled.div`
  padding: 0.5em;
  background-color: aquamarine;
  position: relative;
  padding-bottom: 1em;

  ${ErrorWrapper} {
    position: absolute;
    bottom: 0;
  }
`

const FormField = styled.label`
  display: flex;
  flex-direction: column;

  > input {
    width: auto;
    /* min-width: 32ch; */
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
    max-width: 400px;
    background-color: antiquewhite;
    width: 100%;
    padding: 0.5em;
    border-radius: 8px;
  }
`

const SettingsButtonSubmit = styled.button`
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  background: #355df1;
  font-size: 1.4rem;
  color: var(--color-text-CTA);
  -webkit-letter-spacing: 0;
  -moz-letter-spacing: 0;
  -ms-letter-spacing: 0;
  letter-spacing: 0;
  line-height: 1;
  margin: 0 1.6rem;
  border-radius: 0.6rem;
  outline: 0;
  height: 3.6rem;
  letter-spacing: 0.03rem;
`

const SettingsButtonReset = styled(SettingsButtonSubmit)`
  background: #c7cbda;
  color: var(--color-text-active);
`

export const WCSettings: React.FC<WCSettingsProps> = ({ register, errors }) => {
  return (
    <div>
      <Disclaimer>
        <p>
          Here you can set InfuraId or RPC URl that willbe used for connecting WalletConnect provider to mainnet. It is
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

interface SettingsFormData {
  walletconnect: WCOptions
}

// validates only walletconnect slice of form data
const WCresolver = (
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
          if (currentError.path.length === 0 && currentError.type === 'object.oxor') {
            return {
              ...previous,
              infuraId: currentError,
              rpc: currentError,
            }
          }
          return {
            ...previous,
            [currentError.path[0]]: currentError,
          }
        }, {})
      : null,
  }
}

const composeValuesErrors = <T extends SettingsFormData, K extends keyof T>(
  ...obj: { errors: null | FieldErrors<T[K]>; values: null | T[K]; name: K }[]
): {
  values: T | null
  errors: FieldErrors<T> | null
} => {
  const { errors, values } = obj.reduce<{
    errors: null | FieldErrors<T>
    values: null | T
  }>(
    (acc, elem) => {
      // accumulate errors
      // or leave as null
      if (elem.errors) {
        if (!acc.errors) acc.errors = {}

        acc.errors = {
          ...acc.errors,
          [elem.name]: elem.errors,
        }
      }

      // accumulate values
      // or make null if there are errors
      if (acc.errors) {
        acc.values = null
        return acc
      }

      if (!elem.values) return acc

      if (!acc.values) acc.values = {} as T
      acc.values = {
        ...acc.values,
        [elem.name]: elem.values,
      }

      return acc
    },
    { errors: null, values: null },
  )

  return {
    values: errors ? null : values,
    errors,
  }
}

const resolver: ValidationResolver<SettingsFormData> = data => {
  const { walletconnect } = data

  const result = WCresolver(walletconnect)

  // potentially allow for Setting sections other than WalletConnect
  const { values, errors } = composeValuesErrors(result)

  return {
    values: errors ? {} : values || {},
    errors: errors || {},
  }
}

const SettingsWrapper = styled.div`
  width: 100%;
`

const getDefaultSettings = (): SettingsFormData => ({
  walletconnect: getWCOptionsFromStorage(),
})

export const Settings: React.FC = () => {
  // to not touch localStorage on every render
  const [defaultValues] = useState(getDefaultSettings)

  const { register, handleSubmit, errors, control } = useForm<SettingsFormData>({
    validationResolver: resolver,
    defaultValues,
  })

  const onSubmit = async (data: SettingsFormData): Promise<void> => {
    if (data.walletconnect) {
      if (!setCustomWCOptions(data.walletconnect)) return

      await walletApi.reconnectWC()
    }
  }

  return (
    <SettingsWrapper>
      <form onSubmit={handleSubmit(onSubmit)}>
        <WCSettings register={register} errors={errors} />
        <div>
          <SettingsButtonReset type="reset">Reset</SettingsButtonReset>
          <SettingsButtonSubmit type="submit">Apply Settings</SettingsButtonSubmit>
        </div>
      </form>
      <DevTool control={control} />
    </SettingsWrapper>
  )
}
