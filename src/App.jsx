import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Calculator, Percent, TrendingUp, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import logoMentorial from './assets/logo-mentorial.png'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    comissao: '',
    imposto: '',
    taxaCartao: '',
    outroCusto: '',
    margemLucro: ''
  })
  
  const [resultado, setResultado] = useState(null)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1) // Novo estado para controlar a etapa atual
  const [custoInsumo, setCustoInsumo] = useState("")
  const [precoFinal, setPrecoFinal] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const handleCalcularPrecoFinal = () => {
    const custo = parseFloat(custoInsumo.replace(",", "."))
    if (isNaN(custo) || custo <= 0) {
      alert("Por favor, insira um valor de custo válido.")
      return
    }
    const markupDivisor = parseFloat(resultado.markupDivisor)
    const preco = (custo * markupDivisor).toFixed(2)
    setPrecoFinal(preco)
  }

  const validateStep = (step) => {
    const newErrors = {}
    let isValid = true

    if (step === 1) {
      const fieldsToValidate = ['imposto', 'comissao', 'taxaCartao']
      fieldsToValidate.forEach(field => {
        const value = formData[field].replace(',', '.')
        const numValue = parseFloat(value)
        if (!value || value.trim() === '') {
          newErrors[field] = 'Este campo é obrigatório'
          isValid = false
        } else if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = 'Digite um valor válido'
          isValid = false
        } else if (numValue > 100) {
          newErrors[field] = 'O valor não pode ser maior que 100%'
          isValid = false
        }
      })
    } else if (step === 2) {
      const fieldsToValidate = ['outroCusto']
      fieldsToValidate.forEach(field => {
        const value = formData[field].replace(',', '.')
        const numValue = parseFloat(value)
        if (!value || value.trim() === '') {
          newErrors[field] = 'Este campo é obrigatório'
          isValid = false
        } else if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = 'Digite um valor válido'
          isValid = false
        } else if (numValue > 100) {
          newErrors[field] = 'O valor não pode ser maior que 100%'
          isValid = false
        }
      })
    } else if (step === 3) {
      const fieldsToValidate = ['margemLucro']
      fieldsToValidate.forEach(field => {
        const value = formData[field].replace(',', '.')
        const numValue = parseFloat(value)
        if (!value || value.trim() === '') {
          newErrors[field] = 'Este campo é obrigatório'
          isValid = false
        } else if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = 'Digite um valor válido'
          isValid = false
        } else if (numValue > 100) {
          newErrors[field] = 'O valor não pode ser maior que 100%'
          isValid = false
        }
      })
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1)
  }

  const calcularMarkup = () => {
    if (!validateStep(currentStep)) return
    
    const comissao = parseFloat(formData.comissao.replace(',', '.'))
    const imposto = parseFloat(formData.imposto.replace(',', '.'))
    const taxaCartao = parseFloat(formData.taxaCartao.replace(',', '.'))
    const outroCusto = parseFloat(formData.outroCusto.replace(',', '.'))
    const margemLucro = parseFloat(formData.margemLucro.replace(',', '.'))
    
    const somaPercentuais = comissao + imposto + taxaCartao + outroCusto + margemLucro
    
    const markupDivisor = 1 / (1 - (somaPercentuais / 100))
    
    setResultado({
      comissao,
      imposto,
      taxaCartao,
      outroCusto,
      margemLucro,
      somaPercentuais,
      markupDivisor: markupDivisor.toFixed(2)
    })
    setCurrentStep(4) // Vai para a página de resultados
  }

  const resetForm = () => {
    setFormData({
      comissao: '',
      imposto: '',
      taxaCartao: '',
      outroCusto: '',
      margemLucro: ''
    })
    setResultado(null)
    setErrors({})
    setCurrentStep(1)
  }

  const questionsStep1 = [
    {
      id: 'imposto',
      label: 'Qual o percentual de imposto que você paga sobre faturamento?',
      placeholder: 'Ex: 12,0',
      icon: Percent
    },
    {
      id: 'comissao',
      label: 'Qual o percentual de comissão pago aos vendedores ou executores?',
      placeholder: 'Ex: 5,5',
      icon: Percent
    },
    {
      id: 'taxaCartao',
      label: 'Qual percentual da taxa de cartão que você utiliza?',
      placeholder: 'Ex: 3,2',
      icon: Percent
    }
  ]

  const questionsStep2 = [
    {
      id: 'outroCusto',
      label: 'Outros custos/despesas percentuais variáveis sobre as vendas',
      placeholder: 'Ex: 1,5',
      icon: Percent
    }
  ]

  const questionsStep3 = [
    {
      id: 'margemLucro',
      label: 'Qual o percentual de margem de lucro que você quer obter ao final?',
      placeholder: 'Ex: 15,0',
      icon: Percent
    }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardContent className="p-6 md:p-8 space-y-6">
            {questionsStep1.map((question) => {
              const Icon = question.icon
              return (
                <div key={question.id} className="space-y-2">
                  <Label 
                    htmlFor={question.id}
                    className="text-sm font-medium text-gray-700"
                  >
                    {question.label}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id={question.id}
                      type="text"
                      placeholder={question.placeholder}
                      value={formData[question.id]}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className={`pl-10 pr-8 ${errors[question.id] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  {errors[question.id] && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors[question.id]}</span>
                    </div>
                  )}
                </div>
              )
            })}
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleNextStep}>
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        )
      case 2:
        return (
          <CardContent className="p-6 md:p-8 space-y-6">
            {questionsStep2.map((question) => {
              const Icon = question.icon
              return (
                <div key={question.id} className="space-y-2">
                  <Label 
                    htmlFor={question.id}
                    className="text-sm font-medium text-gray-700"
                  >
                    {question.label}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id={question.id}
                      type="text"
                      placeholder={question.placeholder}
                      value={formData[question.id]}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className={`pl-10 pr-8 ${errors[question.id] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  {errors[question.id] && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors[question.id]}</span>
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex justify-between pt-4">
              <Button onClick={handlePreviousStep} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
              </Button>
              <Button onClick={handleNextStep}>
                Próximo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        )
      case 3:
        return (
          <CardContent className="p-6 md:p-8 space-y-6">
            {questionsStep3.map((question) => {
              const Icon = question.icon
              return (
                <div key={question.id} className="space-y-2">
                  <Label 
                    htmlFor={question.id}
                    className="text-sm font-medium text-gray-700"
                  >
                    {question.label}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id={question.id}
                      type="text"
                      placeholder={question.placeholder}
                      value={formData[question.id]}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className={`pl-10 pr-8 ${errors[question.id] ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                  {errors[question.id] && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors[question.id]}</span>
                    </div>
                  )}
                </div>
              )
            })}
            <div className="flex justify-between pt-4">
              <Button onClick={handlePreviousStep} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
              </Button>
              <Button 
                onClick={calcularMarkup}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calcular Markup
              </Button>
            </div>
          </CardContent>
        )
      case 4:
        return (
          <CardContent className="p-6 md:p-8">
            {resultado ? (
              <div className="space-y-6">
                {/* Markup Divisor Principal */}
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                  <div className="text-sm text-green-700 font-medium mb-2">
                    SEU MARKUP DIVISOR É:
                  </div>
                  <div className="text-4xl font-bold text-green-800">
                    {resultado.markupDivisor}
                  </div>
                  <div className="text-sm text-green-600 mt-2">
                    Multiplique seus custos por este valor
                  </div>
                </div>

                {/* Breakdown dos Percentuais */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 border-b pb-2">
                    Breakdown dos Percentuais:
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Comissão:</span>
                      <span className="font-medium">{resultado.comissao}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Impostos:</span>
                      <span className="font-medium">{resultado.imposto}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Taxa Cartão:</span>
                      <span className="font-medium">{resultado.taxaCartao}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Outro Custo:</span>
                      <span className="font-medium">{resultado.outroCusto}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Margem Lucro:</span>
                      <span className="font-medium">{resultado.margemLucro}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-semibold text-blue-800">Total dos Percentuais:</span>
                    <span className="font-bold text-blue-800">{resultado.somaPercentuais}%</span>
                  </div>
                </div>

                {/* Cálculo do Preço Final */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium text-gray-800 mb-2">Calcule o Preço Final:</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custoInsumo" className="text-sm font-medium text-gray-700">Custo do Insumo / Mercadoria (R$):</Label>
                      <Input
                        id="custoInsumo"
                        type="number"
                        placeholder="Ex: 100,00"
                        value={custoInsumo}
                        onChange={(e) => setCustoInsumo(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleCalcularPrecoFinal} className="w-full">
                      Calcular Preço Final
                    </Button>
                    {precoFinal && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="font-semibold text-blue-800">Preço Final Sugerido:</span>
                        <span className="font-bold text-blue-800 ml-2">R$ {precoFinal}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center pt-4">
                  <Button onClick={resetForm} variant="outline">
                    Recomeçar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Preencha os campos para ver o resultado</p>
              </div>
            )}
          </CardContent>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={logoMentorial} 
              alt="Mentorial Contabilidade" 
              className="h-16 w-auto"
            />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Simulador para Precificação - Markup Divisor
              </h1>
              <p className="text-gray-600 mt-2">
                Calcule o markup divisor ideal para precificação do seu negócio
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 w-full max-w-2xl mx-auto">
          {/* Formulário/Resultados */}
          <Card className="shadow-lg w-full">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>
                  {currentStep === 1 && "Dados para Cálculo - Etapa 1/3"}
                  {currentStep === 2 && "Dados para Cálculo - Etapa 2/3"}
                  {currentStep === 3 && "Dados para Cálculo - Etapa 3/3"}
                  {currentStep === 4 && "Resultado do Cálculo"}
                </span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                {currentStep === 1 && "Preencha os percentuais abaixo para calcular seu markup divisor"}
                {currentStep === 2 && "Preencha o percentual de outros custos/despesas"}
                {currentStep === 3 && "Preencha o percentual de margem de lucro desejada"}
                {currentStep === 4 && "Seu markup divisor calculado"}
              </CardDescription>
            </CardHeader>
            {renderStepContent()}
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-8 p-6 bg-blue-600 text-white rounded-lg text-center shadow-lg max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Economize tempo e dinheiro com a Mentorial Contabilidade</h2>
          <p className="text-blue-100 mb-4">Há mais de 11 anos ajudando micro e pequenas empresas a reduzir tributos de forma legal e segura.</p>
          <a 
            href="https://api.whatsapp.com/send/?phone=5544997732929&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-700 font-semibold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
          >
            Fale com um especialista
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2025 Mentorial Contabilidade - Simulador para Precificação - Markup Divisor
            </p>
            <p className="text-xs mt-1">
              Ferramenta desenvolvida para auxiliar no cálculo de preços
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App


