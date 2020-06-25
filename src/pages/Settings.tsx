import React from 'react'
import { useForm, FormContextValues, ErrorMessage, ValidationResolver } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import styled from 'styled-components'
import { MEDIA } from 'const'

interface WCSettingsProps {
  register: FormContextValues['register']
}

const OuterFormSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.5em;
  /* min-width: 80vw; */

  > div {
    margin: 0.5em;
  }
`

const AlternativesSection = styled.div`
  display: grid;
  outline: dotted;
  /* flex-wrap: wrap; */
  grid-template-columns: 1fr auto 1fr;
  /* grid-template-rows: 1fr auto 1fr; */
  /* grid-template-areas: 'field or field' 'field or field'; */

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

const InnerFormSection = styled.div`
  padding: 0.5em;
  background-color: aquamarine;
  /* flex: 1 0 0; */
  /* grid-area: field; */
`

const FormField = styled.label`
  display: flex;
  flex-direction: column;

  > input {
    width: auto;
    /* min-width: 32ch; */
    font-size: 1em;
    font-weight: normal;
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

const SettingsButton = styled.button`
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  background: #c2d1ff;
  font-size: 1.4rem;
  color: var(--color-text-active);
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

export const WCSettings: React.FC<WCSettingsProps> = ({ register }) => {
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
          </InnerFormSection>
          <OrSeparator>
            <span>OR</span>
          </OrSeparator>
          <InnerFormSection>
            <FormField>
              <span>RPC URL</span>
              <input type="text" name="walletconnect.rpc" ref={register} />
            </FormField>
          </InnerFormSection>
        </AlternativesSection>

        <InnerFormSection>
          <FormField>
            <span>Bridge URL</span>
            <input type="text" name="walletconnect.bridge" ref={register} />
          </FormField>
        </InnerFormSection>
      </OuterFormSection>
    </div>
  )
}

type WCSettingsData = (
  | {
      infuraId: string
    }
  | {
      rpc: string
    }
) & {
  bridge?: string
}

interface SettingsFormData {
  walletconnect: WCSettingsData
}

// const resolver: ValidationResolver<SettingsFormData> = (data, validationContext) => {
// const { error, value: values } = validationSchema.validate(data, {
//   abortEarly: false,
// })
// const error = false
// return {
//   values: error ? {} : values,
//   errors: error
//     ? error.details.reduce((previous, currentError) => {
//         return {
//           ...previous,
//           [currentError.path[0]]: currentError,
//         }
//       }, {})
//     : {},
// }
// }

export const Settings: React.FC = () => {
  const { register, handleSubmit, watch, errors, control, getValues } = useForm<SettingsFormData>({
    // validationResolver: resolver,
  })
  console.log('getValues', getValues({ nest: true }))

  const onSubmit = (data: SettingsFormData): void => {
    console.log('WC_FORM::data', data)
  }

  return (
    <div style={{ width: '100%' }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <WCSettings register={register} />
        <ErrorMessage errors={errors} name="walletconnect" />
        <div>
          <SettingsButton type="submit">Apply Settings</SettingsButton>
        </div>
      </form>
      <DevTool control={control} />
    </div>
  )
}
