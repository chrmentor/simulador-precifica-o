import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Calculator, Percent, TrendingUp, AlertCircle, ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import emailjs from '@emailjs/browser'
import logoMentorial from './assets/logo-mentorial.png'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    comissao: "",
    imposto: "",
    taxaCartao: "",
    outroCusto: "",
    margemLucro: ""
  })
  const [comissaoDisabled, setComissaoDisabled] = useState(false)
  const [taxaCartaoDisabled, setTaxaCartaoDisabled] = useState(false)
  const [outroCustoDisabled, setOutroCustoDisabled] = useState(false)
  
  const [resultado, setResultado] = useState(null)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1) // Novo estado para controlar a etapa atual
  const [custoInsumo, setCustoInsumo] = useState("")
  const [precoFinal, setPrecoFinal] = useState(null)
  const [userData, setUserData] = useState({
    nome: "",
    whatsapp: ""
  })

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

  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({
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
      const fieldsToValidate = [ { id: 'imposto', disabled: false }, { id: 'comissao', disabled: comissaoDisabled }, { id: 'taxaCartao', disabled: taxaCartaoDisabled } ]
      fieldsToValidate.forEach(field => {
        if (!field.disabled) {
          const value = formData[field.id].replace(',', '.')
          const numValue = parseFloat(value)
          if (!value || value.trim() === '') {
            newErrors[field.id] = 'Este campo é obrigatório'
            isValid = false
          } else if (isNaN(numValue) || numValue < 0) {
            newErrors[field.id] = 'Digite um valor válido'
            isValid = false
          } else if (numValue > 100) {
            newErrors[field.id] = 'O valor não pode ser maior que 100%'
            isValid = false
          }
        }
      })
    } else if (step === 2) {
      if (!outroCustoDisabled) {
        const value = formData.outroCusto.replace(',', '.')
        const numValue = parseFloat(value)
        if (!value || value.trim() === '') {
          newErrors.outroCusto = 'Este campo é obrigatório'
          isValid = false
        } else if (isNaN(numValue) || numValue < 0) {
          newErrors.outroCusto = 'Digite um valor válido'
          isValid = false
        } else if (numValue > 100) {
          newErrors.outroCusto = 'O valor não pode ser maior que 100%'
          isValid = false
        }
      }
    } else if (step === 3) {
      const fieldsToValidate = ["margemLucro"]
      fieldsToValidate.forEach(field => {
        const value = formData[field].replace(",", ".")
        const numValue = parseFloat(value)
        if (!value || value.trim() === "") {
          newErrors[field] = "Este campo é obrigatório"
          isValid = false
        } else if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = "Digite um valor válido"
          isValid = false
        } else if (numValue > 100) {
          newErrors[field] = "O valor não pode ser maior que 100%"
          isValid = false
        }
      })
      const custo = custoInsumo.replace(",", ".")
      const numCusto = parseFloat(custo)
      if (!custo || custo.trim() === "") {
        newErrors.custoInsumo = "Este campo é obrigatório"
        isValid = false
      } else if (isNaN(numCusto) || numCusto <= 0) {
        newErrors.custoInsumo = "Digite um valor válido"
        isValid = false
      }
    } else if (step === 4) {
      // Validação para a nova etapa de coleta de dados
      if (!userData.nome || userData.nome.trim() === '') {
        newErrors.nome = 'Nome é obrigatório'
        isValid = false
      }
      if (!userData.whatsapp || userData.whatsapp.trim() === '') {
        newErrors.whatsapp = 'WhatsApp é obrigatório'
        isValid = false
      } else if (!/^\d{10,11}$/.test(userData.whatsapp.replace(/\D/g, ''))) {
        newErrors.whatsapp = 'Digite um número de WhatsApp válido'
        isValid = false
      }
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

  const handleProceedToResults = async () => {
    if (validateStep(currentStep)) {
      const custo = parseFloat(custoInsumo.replace(",", "."))
      const markupDivisor = parseFloat(resultado.markupDivisor)
      const preco = (custo * markupDivisor).toFixed(2)
      setPrecoFinal(preco)

      try {
        // Preparar os dados para o EmailJS
        const templateParams = {
          nome: userData.nome,
          whatsapp: userData.whatsapp,
          imposto: formData.imposto,
          comissao: comissaoDisabled ? '0' : formData.comissao,
          taxaCartao: taxaCartaoDisabled ? '0' : formData.taxaCartao,
          outroCusto: outroCustoDisabled ? '0' : formData.outroCusto,
          margemLucro: formData.margemLucro,
          markupCalculado: resultado?.markupDivisor || 'N/A',
          custoInsumo: custoInsumo || 'Não informado',
          precoVenda: `R$ ${preco}`,
          data: new Date().toLocaleDateString('pt-BR'),
          hora: new Date().toLocaleTimeString('pt-BR')
        }

        // Enviar e-mail via EmailJS
        await emailjs.send(
          'service_ej7aspa', // Service ID
          'template_5cq45iw', // Template ID
          templateParams,
          '8L7JH3KzNJP6q32yB' // Public Key
        )

        console.log('E-mail enviado com sucesso!')
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error)
        // Continuar mesmo se o e-mail falhar
      }

      setCurrentStep(5) // Vai para a página de resultados
    }
  }

  const handleStepClick = (stepNum) => {
    if (stepNum < currentStep) {
      // Sempre permitir voltar para etapas anteriores
      setCurrentStep(stepNum)
    } else if (stepNum > currentStep) {
      // Validar a etapa atual antes de avançar
      if (validateStep(currentStep)) {
        setCurrentStep(stepNum)
      }
    } else if (stepNum === currentStep) {
      // Se clicar na etapa atual, validar e permanecer ou avançar se for o caso
      if (validateStep(currentStep)) {
        if (stepNum === 5 && resultado) {
          setCurrentStep(stepNum)
        } else if (stepNum < 5) {
          setCurrentStep(stepNum)
        }
      }
    }
  }

  const calcularMarkup = () => {
    if (!validateStep(currentStep)) return
    
    const imposto = parseFloat(formData.imposto.replace(',', '.')) || 0
    const comissao = comissaoDisabled ? 0 : (parseFloat(formData.comissao.replace(',', '.')) || 0)
    const taxaCartao = taxaCartaoDisabled ? 0 : (parseFloat(formData.taxaCartao.replace(',', '.')) || 0)
    const outroCusto = outroCustoDisabled ? 0 : (parseFloat(formData.outroCusto.replace(',', '.')) || 0)
    const margemLucro = parseFloat(formData.margemLucro.replace(',', '.')) || 0
    
    const somaPercentuais = imposto + comissao + taxaCartao + outroCusto + margemLucro
    
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
    setCurrentStep(4) // Vai para a nova página de coleta de dados
  }

  const resetForm = () => {
    setFormData({
      comissao: '',
      imposto: '',
      taxaCartao: '',
      outroCusto: '',
      margemLucro: ''
    })
    setComissaoDisabled(false)
    setTaxaCartaoDisabled(false)
    setOutroCustoDisabled(false)
    setResultado(null)
    setErrors({})
    setCurrentStep(1)
    setCustoInsumo("")
    setPrecoFinal(null)
    setUserData({
      nome: "",
      whatsapp: ""
    })
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
                      disabled={(question.id === 'comissao' && comissaoDisabled) || (question.id === 'taxaCartao' && taxaCartaoDisabled)}
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
                  {(question.id === 'comissao' || question.id === 'taxaCartao') && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Checkbox
                        id={`disable-${question.id}`}
                        checked={question.id === 'comissao' ? comissaoDisabled : taxaCartaoDisabled}
                        onCheckedChange={(checked) => {
                          if (question.id === 'comissao') {
                            setComissaoDisabled(checked)
                            if (checked) handleInputChange('comissao', '0')
                          } else {
                            setTaxaCartaoDisabled(checked)
                            if (checked) handleInputChange('taxaCartao', '0')
                          }
                        }}
                      />
                      <label
                        htmlFor={`disable-${question.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {question.id === 'comissao' ? 'Não pago comissão' : 'Não pago taxa de cartão'}
                      </label>
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
                      disabled={outroCustoDisabled}
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
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id={`disable-${question.id}`}
                      checked={outroCustoDisabled}
                      onCheckedChange={(checked) => {
                        setOutroCustoDisabled(checked)
                        if (checked) handleInputChange('outroCusto', '0')
                      }}
                    />
                    <label
                      htmlFor={`disable-${question.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Não tenho mais despesas percentuais variáveis
                    </label>
                  </div>
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
            <div className="space-y-2">
              <Label htmlFor="custoInsumo" className="text-sm font-medium text-gray-700">Custo do Insumo / Mercadoria (R$):</Label>
              <Input
                id="custoInsumo"
                type="number"
                placeholder="Ex: 100,00"
                value={custoInsumo}
                onChange={(e) => setCustoInsumo(e.target.value)}
                className={`mt-1 bg-white ${errors.custoInsumo ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.custoInsumo && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.custoInsumo}</span>
                </div>
              )}
            </div>
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
          <CardContent className="p-6 md:p-8 space-y-6">
            {/* Texto persuasivo */}
            <div className="text-center space-y-4 mb-6">
              <div className="text-2xl font-bold text-green-600">
                🎉 Parabéns! Seu Markup foi calculado!
              </div>
              <div className="text-lg text-gray-700">
                Para visualizar seu cálculo e também receber um relatório mais completo por WhatsApp gratuitamente, preencha os dados abaixo:
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 <strong>Bônus:</strong> Você receberá dicas exclusivas de precificação e estratégias para aumentar sua margem de lucro!
              </div>
            </div>

            {/* Campos de coleta */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                  Seu nome completo:
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={userData.nome}
                  onChange={(e) => handleUserDataChange('nome', e.target.value)}
                  className={`${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nome && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.nome}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                  Seu WhatsApp (apenas números):
                </Label>
                <Input
                  id="whatsapp"
                  type="text"
                  placeholder="Ex: 11999999999"
                  value={userData.whatsapp}
                  onChange={(e) => handleUserDataChange('whatsapp', e.target.value.replace(/\D/g, ''))}
                  className={`${errors.whatsapp ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.whatsapp && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.whatsapp}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button onClick={handlePreviousStep} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
              </Button>
              <Button 
                onClick={handleProceedToResults}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Ver Meu Resultado 🚀
              </Button>
            </div>
          </CardContent>
        )
      case 5:
        return (
          <CardContent className="p-6 md:p-8">
            {resultado ? (
              <div className="space-y-6">
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


                </div>

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



                {/* Gráfico de Pizza */}
                {precoFinal && (
                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <h4 className="font-bold text-gray-800 mb-4 text-lg text-center">Composição do Preço de Venda (100%):</h4>
                    
                    {/* Layout responsivo: lado a lado no desktop, empilhado no mobile */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-8 space-y-4 md:space-y-0">
                      {/* Legendas */}
                      <div className="flex flex-col space-y-2 text-xs md:text-sm order-2 md:order-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#4299E1' }}></div>
                          <span>Impostos: {resultado.imposto.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#38B2AC' }}></div>
                          <span>Comissão: {resultado.comissao.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#F6AD55' }}></div>
                          <span>Taxa Cartão: {resultado.taxaCartao.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#ED8936' }}></div>
                          <span>Outro Custo: {resultado.outroCusto.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#667EEA' }}></div>
                          <span>Margem de Lucro: {resultado.margemLucro.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#48BB78' }}></div>
                          <span>Custo do Insumo: {((parseFloat(custoInsumo.replace(",", ".")) / parseFloat(precoFinal)) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      
                      {/* Gráfico */}
                      <div className="flex-shrink-0 flex justify-center order-1 md:order-2">
                        <ResponsiveContainer width={250} height={250} className="md:!w-[300px] md:!h-[300px]">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Impostos', value: (resultado.imposto / 100) * parseFloat(precoFinal) },
                                { name: 'Comissão', value: (resultado.comissao / 100) * parseFloat(precoFinal) },
                                { name: 'Taxa Cartão', value: (resultado.taxaCartao / 100) * parseFloat(precoFinal) },
                                { name: 'Outro Custo', value: (resultado.outroCusto / 100) * parseFloat(precoFinal) },
                                { name: 'Margem de Lucro', value: (resultado.margemLucro / 100) * parseFloat(precoFinal) },
                                { name: 'Custo do Insumo', value: parseFloat(custoInsumo.replace(",", ".")) }
                              ]}
                              cx={"50%"}
                              cy={"50%"}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={false}
                            >
                              <Cell key="cell-0" fill="#4299E1" />
                              <Cell key="cell-1" fill="#38B2AC" />
                              <Cell key="cell-2" fill="#F6AD55" />
                              <Cell key="cell-3" fill="#ED8936" />
                              <Cell key="cell-4" fill="#667EEA" />
                              <Cell key="cell-5" fill="#48BB78" />
                            </Pie>
                            <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center pt-4 space-x-4">
                  <Button onClick={handlePreviousStep} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
                  </Button>
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
          <div className="flex justify-center space-x-4 -mt-12 mb-4">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => handleStepClick(stepNum)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                  ${currentStep >= stepNum ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                  ${stepNum <= 3 || (stepNum >= 4 && resultado) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                disabled={stepNum > 3 && !resultado}
                title={`Ir para etapa ${stepNum}`}
              >
                {stepNum}
              </button>
            ))}
          </div>
          {/* Formulário/Resultados */}
          <Card className="shadow-lg w-full">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2 pt-4">
                <Calculator className="h-5 w-5" />
                <span>
                  {currentStep === 1 && "Dados para Cálculo - Etapa 1/3"}
                  {currentStep === 2 && "Dados para Cálculo - Etapa 2/3"}
                  {currentStep === 3 && "Dados para Cálculo - Etapa 3/3"}
                  {currentStep === 4 && "Quase lá! Seus dados para o relatório"}
                  {currentStep === 5 && "Resultado do Cálculo"}
                </span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                {currentStep === 1 && "Preencha os percentuais abaixo para calcular seu markup divisor"}
                {currentStep === 2 && "Preencha o percentual de outros custos/despesas"}
                {currentStep === 3 && "Preencha o percentual de margem de lucro desejada"}
                {currentStep === 4 && "Para receber seu resultado e relatório completo"}
                {currentStep === 5 && "Seu markup divisor calculado"}
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



