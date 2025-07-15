import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Calculator, Percent, TrendingUp, AlertCircle } from 'lucide-react'
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

  const handleInputChange = (field, value) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d.,]/g, '')
    
    setFormData(prev => ({
      ...prev,
      [field]: cleanValue
    }))
    
    // Remove erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    Object.keys(formData).forEach(field => {
      const value = formData[field].replace(',', '.')
      const numValue = parseFloat(value)
      
      if (!value || value.trim() === '') {
        newErrors[field] = 'Este campo é obrigatório'
      } else if (isNaN(numValue) || numValue < 0) {
        newErrors[field] = 'Digite um valor válido'
      } else if (numValue > 100) {
        newErrors[field] = 'O valor não pode ser maior que 100%'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calcularMarkup = () => {
    if (!validateForm()) return
    
    // Converte valores para números
    const comissao = parseFloat(formData.comissao.replace(',', '.'))
    const imposto = parseFloat(formData.imposto.replace(',', '.'))
    const taxaCartao = parseFloat(formData.taxaCartao.replace(',', '.'))
    const outroCusto = parseFloat(formData.outroCusto.replace(',', '.'))
    const margemLucro = parseFloat(formData.margemLucro.replace(',', '.'))
    
    // Soma todos os percentuais
    const somaPercentuais = comissao + imposto + taxaCartao + outroCusto + margemLucro
    
    // Calcula o markup divisor: 1 / (1 - (soma/100))
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
  }

  const questions = [
    {
      id: 'comissao',
      label: 'Qual o percentual de comissão pago aos vendedores?',
      placeholder: 'Ex: 5,5',
      icon: Percent
    },
    {
      id: 'imposto',
      label: 'Qual o percentual de imposto que você paga sobre faturamento?',
      placeholder: 'Ex: 12,0',
      icon: Percent
    },
    {
      id: 'taxaCartao',
      label: 'Qual percentual da taxa de cartão que você utiliza?',
      placeholder: 'Ex: 3,2',
      icon: Percent
    },
    {
      id: 'outroCusto',
      label: 'Outro custo/despesa percentual variável sobre as vendas',
      placeholder: 'Ex: 1,5',
      icon: Percent
    },
    {
      id: 'margemLucro',
      label: 'Qual o percentual de margem de lucro que você quer obter ao final?',
      placeholder: 'Ex: 15,0',
      icon: Percent
    }
  ]

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Dados para Cálculo</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Preencha os percentuais abaixo para calcular seu markup divisor
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {questions.map((question) => {
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
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={calcularMarkup}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Markup
                </Button>
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="px-6"
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Resultado do Cálculo</span>
              </CardTitle>
              <CardDescription className="text-green-100">
                Seu markup divisor calculado
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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

                  {/* Fórmula Explicativa */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-800 mb-2">Como foi calculado:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>1. Soma dos percentuais: {resultado.somaPercentuais}%</div>
                      <div>2. Conversão: {resultado.somaPercentuais}% = {(resultado.somaPercentuais/100).toFixed(3)}</div>
                      <div>3. Cálculo: 1 ÷ (1 - {(resultado.somaPercentuais/100).toFixed(3)}) = {resultado.markupDivisor}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Preencha os campos ao lado e clique em "Calcular Markup" para ver o resultado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2024 Mentorial Contabilidade - Simulador para Precificação - Markup Divisor
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


