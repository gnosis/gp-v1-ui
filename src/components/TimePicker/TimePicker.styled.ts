import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
body > div.MuiDialog-root { 
    h3, h4, h5, span.MuiTypography-overline {
      color: var(--color-text-CTA);
    }

    svg.MuiSvgIcon-root {
      fill: var(--color-text-CTA);
    }

    label.MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated.MuiInputLabel-shrink.MuiFormLabel-filled,
    input.MuiInputBase-input.MuiInput-input,
    p.MuiFormHelperText-root.MuiFormHelperText-filled,
    p.MuiFormHelperText-root,
    label.MuiFormLabel-root.MuiInputLabel-root.MuiInputLabel-formControl.MuiInputLabel-animated {
      color: var(--color-text-primary);
      font-size: 1.3rem;
    }

    h6.MuiTypography-root.MuiPickersCalendarHeader-monthText.MuiTypography-subtitle1.MuiTypography-alignCenter, 
    h6.MuiTypography-root.MuiTypography-subtitle1.MuiTypography-alignCenter, 
    button.MuiPickersYear-yearButton,
    span {
      color: var(--color-text-primary);
    }

    span {
      font-size: 1.1rem;

      &.MuiTabs-indicator {
        background-color: var(--color-background-pageWrapper);
      }
      
      &.MuiPickersClockNumber-clockNumberSelected {
        color: var(--color-text-CTA);
      }
    }
    
    button {
      &.Mui-selected.MuiTab-fullWidth:hover {
        background: var(--color-background-modali);
      }

      &.MuiPickersYear-yearButton.MuiPickersYear-yearSelected,
      &.MuiPickersYear-yearSelected:focus, 
      &.MuiPickersYear-yearSelected:hover, 
      &.MuiPickersYear-yearButton:focus, 
      &.MuiPickersYear-yearButton:hover {
        background-color: var(--color-background-balance-button-hover);
        color: var(--color-background-lighter);
      }

      &.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary {
        background: var(--color-background-CTA);
        font-weight: bold;
        border-radius: 3rem;
        
        &:hover {
          background-color: var(--color-background-button-hover);
          > span { color: var(--color-text-button-hover); }
        }

        > span {
          color: var(--color-text-CTA);
        }
      }

      &.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary:nth-child(2) {
        background-color: var(--color-background-pageWrapper);

        > span {
          color: var(--color-button-primary);
        }
      }

      &.MuiButtonBase-root.MuiPickersDay-day.MuiPickersDay-dayDisabled.MuiPickersDay-dayWithMargin {
        span {
          color: var(--color-background-input);
        }
      }

      &.MuiPickersDay-dayWithMargin:not(.MuiPickersDay-daySelected),
      &.MuiPickersYear-yearSelected, 
      &.MuiPickersYear-yearButton {
        background-color: var(--color-background-pageWrapper);

        &:hover, &:focus {
          background-color: var(--color-background-balance-button-hover);

          span.MuiPickersDay-dayLabel {
            color: var(--color-background-pageWrapper);
          }
        }
      }

      &.MuiPickersDay-daySelected,
      &.MuiPickersDay-day:focus {
        background-color: var(--color-background-balance-button-hover);

        span.MuiPickersDay-dayLabel {
          color: var(--color-background-pageWrapper);
        }
      }
      

      &.MuiPickersArrowSwitcher-iconButton {
        background-color: var(--color-background-modali);
      }
    }

    div {
      .MuiPickersClock-pin,
      .MuiPickersClockPointer-pointer,
      .MuiPickersClockPointer-thumb.MuiPickersClockPointer-noPoint {
        background-color: var(--color-background-CTA);
        border-color: var(--color-background-CTA);
      }

      .MuiPickersModalDialog-dialogRoot {
        background: var(--color-background-pageWrapper);
      }
    }

    .MuiToolbar-root.MuiToolbar-regular.MuiPickersToolbar-toolbar.MuiPickersDateTimePickerToolbar-toolbar.MuiToolbar-gutters, 
    div.MuiPaper-root.MuiPaper-elevation1.MuiPaper-rounded > div.MuiTabs-root.MuiPickerDTTabs-tabs {
      background-color: var(--color-background-CTA);
    }
  }
`
