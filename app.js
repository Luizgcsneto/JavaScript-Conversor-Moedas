const currenceOneEl =  document.querySelector('[data-js="currency-one"]')
const currenceTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl =  document.querySelector('[data-js="currencies-container"]')
const convertedValueEl =  document.querySelector('[data-js="converted-value"]')
const convertPrecisionEl =  document.querySelector('[data-js="conversion-precision"]')
const currencyOneTimesEl =  document.querySelector('[data-js="currency-one-times"]')


const showError = err => {
    const div = document.createElement('div')
    const button = document.createElement('button')
    div.textContent = err.message
    div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
    div.setAttribute('role','alert')
    button.classList.add('btn-close')
    button.setAttribute('type','button')
    button.setAttribute('aria-label','close')
    button.addEventListener('click', () => {
        div.remove()
    })

    div.appendChild(button)
    currenciesEl.insertAdjacentElement('afterend',div)
}

const state = (() => {
    let exchangeRate = {}

    return {
        getExchangeRate: () => exchangeRate,
        setExchangeRate: newExchangeRate => {
            if(!newExchangeRate.conversion_rates){
                showError({ message: 'o objeto precisa ter uma propriedade conversion_rates' })
                return
            }

            exchangeRate = newExchangeRate
            return exchangeRate
        }

    }
})()

const getMessageError = errorType => ({
    'unsupported-code': 'A moeda não cadastrada no nosso banco de dados',
    'malformed-request' : 'o endpoint da sua aplicação precisa seguir o padrão',
    'invalid-key': 'a chave da sua api é inválida.',
    'inactive-account' : 'o seu endereço de e-mail não foi confirmado',
    'quota-reached': 'a sua cota de requisições ultrapassou o limie do seu plano.'
})[errorType] || 'Não foi possível obter informações'

const getUrl = currency => `https://v6.exchangerate-api.com/v6/e554f189bc2163554389c309/latest/${currency}`



const fetchExchangeRate = async url => {
    try {
       const response = await fetch(url)

       if(!response.ok){
            throw new Error('sua conexão falhou, não foi possível obter informações')
       }

       const exchangeRateData = await response.json()

       if(exchangeRateData.result === "error"){
            throw new Error(getMessageError[exchangeRateData['error-type']])
       }

       return exchangeRateData
    } catch (err) {
       showError(err)
    }
}

const showInitialInfo = ({ conversion_rates }) => {
    const getOptions = selectedCurrency => Object.keys(conversion_rates)
    .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
    .join()
    currenceOneEl.innerHTML = getOptions('USD')
    currenceTwoEl.innerHTML = getOptions('BRL')
    convertedValueEl.textContent = conversion_rates.BRL.toFixed(2)
    convertPrecisionEl.textContent = `1 USD = ${conversion_rates.BRL}`
}

const init = async () => {
  const exchangeRate = state.setExchangeRate(await fetchExchangeRate(getUrl('USD')))
    if(exchangeRate && exchangeRate.conversion_rates){
        showInitialInfo(exchangeRate)
    }
}

const showUpdateRates = ({ conversion_rates }) => {
     convertedValueEl.textContent = (currencyOneTimesEl.value *  conversion_rates[currenceTwoEl.value]).toFixed(2)
    convertPrecisionEl.textContent = ` 1 ${currenceOneEl.value} ${1 *  conversion_rates[currenceTwoEl.value]} ${currenceTwoEl.value}`
}

currencyOneTimesEl.addEventListener('input', e => {
    const { conversion_rates } = state.getExchangeRate()
    const currencyTwoEl = conversion_rates[currenceTwoEl.value]
    convertedValueEl.textContent = (e.target.value * currencyTwoEl).toFixed(2)
})

currenceTwoEl.addEventListener('input', () =>{
    const exchangeRate = state.getExchangeRate()
    showUpdateRates(exchangeRate)
})

currenceOneEl.addEventListener('input', async e => {
    const url = getUrl(e.target.value)
    const newExchangeRate = await fetchExchangeRate(url)
    const exchangeRate = state.setExchangeRate(newExchangeRate)
    showUpdateRates(exchangeRate)
})

init()

