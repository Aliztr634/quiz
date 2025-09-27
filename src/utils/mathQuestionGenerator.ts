export interface MathQuestion {
  question_text: string
  options: string[]
  correct_answer: number
  timer_seconds: number
  difficulty: 'easy' | 'medium' | 'hard'
  question_type: string
}

export class MathQuestionGenerator {
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // private static randomFloat(min: number, max: number, decimals: number = 2): number {
  //   return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
  // }

  // Generate basic arithmetic questions
  static generateArithmetic(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    const types = ['addition', 'subtraction', 'multiplication', 'division']
    const type = types[Math.floor(Math.random() * types.length)]
    
    switch (type) {
      case 'addition':
        return this.generateAddition(difficulty)
      case 'subtraction':
        return this.generateSubtraction(difficulty)
      case 'multiplication':
        return this.generateMultiplication(difficulty)
      case 'division':
        return this.generateDivision(difficulty)
      default:
        return this.generateAddition(difficulty)
    }
  }

  private static generateAddition(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(1, 20)
        b = this.randomInt(1, 20)
        answer = a + b
        timer = 30
        break
      case 'medium':
        a = this.randomInt(10, 100)
        b = this.randomInt(10, 100)
        answer = a + b
        timer = 45
        break
      case 'hard':
        a = this.randomInt(100, 999)
        b = this.randomInt(100, 999)
        answer = a + b
        timer = 60
        break
    }

    const question = `What is ${a} + ${b}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'addition'
    }
  }

  private static generateSubtraction(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(10, 30)
        b = this.randomInt(1, a)
        answer = a - b
        timer = 30
        break
      case 'medium':
        a = this.randomInt(50, 200)
        b = this.randomInt(10, a)
        answer = a - b
        timer = 45
        break
      case 'hard':
        a = this.randomInt(500, 1000)
        b = this.randomInt(100, a)
        answer = a - b
        timer = 60
        break
    }

    const question = `What is ${a} - ${b}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'subtraction'
    }
  }

  private static generateMultiplication(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(2, 12)
        b = this.randomInt(2, 12)
        answer = a * b
        timer = 30
        break
      case 'medium':
        a = this.randomInt(5, 25)
        b = this.randomInt(5, 25)
        answer = a * b
        timer = 45
        break
      case 'hard':
        a = this.randomInt(10, 50)
        b = this.randomInt(10, 50)
        answer = a * b
        timer = 60
        break
    }

    const question = `What is ${a} × ${b}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'multiplication'
    }
  }

  private static generateDivision(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        b = this.randomInt(2, 12)
        answer = this.randomInt(2, 12)
        a = b * answer
        timer = 30
        break
      case 'medium':
        b = this.randomInt(5, 25)
        answer = this.randomInt(5, 25)
        a = b * answer
        timer = 45
        break
      case 'hard':
        b = this.randomInt(10, 50)
        answer = this.randomInt(10, 50)
        a = b * answer
        timer = 60
        break
    }

    const question = `What is ${a} ÷ ${b}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'division'
    }
  }

  // Generate fraction questions
  static generateFractions(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    const types = ['addition', 'subtraction', 'multiplication', 'division']
    const type = types[Math.floor(Math.random() * types.length)]
    
    switch (type) {
      case 'addition':
        return this.generateFractionAddition(difficulty)
      case 'subtraction':
        return this.generateFractionSubtraction(difficulty)
      case 'multiplication':
        return this.generateFractionMultiplication(difficulty)
      case 'division':
        return this.generateFractionDivision(difficulty)
      default:
        return this.generateFractionAddition(difficulty)
    }
  }

  private static generateFractionAddition(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, c: number, d: number
    let answer: string
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(1, 5)
        b = this.randomInt(2, 8)
        c = this.randomInt(1, 5)
        d = b // Same denominator
        answer = this.simplifyFraction(a + c, d)
        timer = 45
        break
      case 'medium':
        a = this.randomInt(1, 8)
        b = this.randomInt(3, 12)
        c = this.randomInt(1, 8)
        d = this.randomInt(3, 12)
        answer = this.addFractions(a, b, c, d)
        timer = 60
        break
      case 'hard':
        a = this.randomInt(1, 12)
        b = this.randomInt(5, 20)
        c = this.randomInt(1, 12)
        d = this.randomInt(5, 20)
        answer = this.addFractions(a, b, c, d)
        timer = 90
        break
    }

    const question = `What is ${a}/${b} + ${c}/${d}?`
    const options = this.generateFractionOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer),
      timer_seconds: timer,
      difficulty,
      question_type: 'fraction_addition'
    }
  }

  private static generateFractionSubtraction(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, c: number, d: number
    let answer: string
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(3, 8)
        b = this.randomInt(2, 8)
        c = this.randomInt(1, a - 1)
        d = b // Same denominator
        answer = this.simplifyFraction(a - c, d)
        timer = 45
        break
      case 'medium':
        a = this.randomInt(5, 12)
        b = this.randomInt(3, 12)
        c = this.randomInt(1, a - 1)
        d = this.randomInt(3, 12)
        answer = this.subtractFractions(a, b, c, d)
        timer = 60
        break
      case 'hard':
        a = this.randomInt(8, 20)
        b = this.randomInt(5, 20)
        c = this.randomInt(1, a - 1)
        d = this.randomInt(5, 20)
        answer = this.subtractFractions(a, b, c, d)
        timer = 90
        break
    }

    const question = `What is ${a}/${b} - ${c}/${d}?`
    const options = this.generateFractionOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer),
      timer_seconds: timer,
      difficulty,
      question_type: 'fraction_subtraction'
    }
  }

  private static generateFractionMultiplication(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, c: number, d: number
    let answer: string
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(1, 5)
        b = this.randomInt(2, 8)
        c = this.randomInt(1, 5)
        d = this.randomInt(2, 8)
        answer = this.simplifyFraction(a * c, b * d)
        timer = 45
        break
      case 'medium':
        a = this.randomInt(1, 8)
        b = this.randomInt(3, 12)
        c = this.randomInt(1, 8)
        d = this.randomInt(3, 12)
        answer = this.simplifyFraction(a * c, b * d)
        timer = 60
        break
      case 'hard':
        a = this.randomInt(1, 12)
        b = this.randomInt(5, 20)
        c = this.randomInt(1, 12)
        d = this.randomInt(5, 20)
        answer = this.simplifyFraction(a * c, b * d)
        timer = 90
        break
    }

    const question = `What is ${a}/${b} × ${c}/${d}?`
    const options = this.generateFractionOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer),
      timer_seconds: timer,
      difficulty,
      question_type: 'fraction_multiplication'
    }
  }

  private static generateFractionDivision(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, c: number, d: number
    let answer: string
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(1, 5)
        b = this.randomInt(2, 8)
        c = this.randomInt(1, 5)
        d = this.randomInt(2, 8)
        answer = this.simplifyFraction(a * d, b * c)
        timer = 45
        break
      case 'medium':
        a = this.randomInt(1, 8)
        b = this.randomInt(3, 12)
        c = this.randomInt(1, 8)
        d = this.randomInt(3, 12)
        answer = this.simplifyFraction(a * d, b * c)
        timer = 60
        break
      case 'hard':
        a = this.randomInt(1, 12)
        b = this.randomInt(5, 20)
        c = this.randomInt(1, 12)
        d = this.randomInt(5, 20)
        answer = this.simplifyFraction(a * d, b * c)
        timer = 90
        break
    }

    const question = `What is ${a}/${b} ÷ ${c}/${d}?`
    const options = this.generateFractionOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer),
      timer_seconds: timer,
      difficulty,
      question_type: 'fraction_division'
    }
  }

  // Generate algebra questions
  static generateAlgebra(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    const types = ['linear', 'quadratic', 'system']
    const type = types[Math.floor(Math.random() * types.length)]
    
    switch (type) {
      case 'linear':
        return this.generateLinearEquation(difficulty)
      case 'quadratic':
        return this.generateQuadraticEquation(difficulty)
      case 'system':
        return this.generateSystemOfEquations(difficulty)
      default:
        return this.generateLinearEquation(difficulty)
    }
  }

  private static generateLinearEquation(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, c: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(1, 5)
        b = this.randomInt(1, 10)
        c = this.randomInt(1, 20)
        answer = (c - b) / a
        timer = 60
        break
      case 'medium':
        a = this.randomInt(2, 10)
        b = this.randomInt(1, 20)
        c = this.randomInt(10, 50)
        answer = (c - b) / a
        timer = 90
        break
      case 'hard':
        a = this.randomInt(5, 20)
        b = this.randomInt(1, 50)
        c = this.randomInt(50, 200)
        answer = (c - b) / a
        timer = 120
        break
    }

    const question = `Solve for x: ${a}x + ${b} = ${c}`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'linear_equation'
    }
  }

  private static generateQuadraticEquation(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    // For simplicity, we'll generate equations that factor nicely
    let a: number, b: number, c: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = 1
        b = this.randomInt(-10, 10)
        c = this.randomInt(-10, 10)
        // Find a solution
        answer = this.randomInt(-5, 5)
        timer = 90
        break
      case 'medium':
        a = this.randomInt(1, 3)
        b = this.randomInt(-15, 15)
        c = this.randomInt(-15, 15)
        answer = this.randomInt(-8, 8)
        timer = 120
        break
      case 'hard':
        a = this.randomInt(1, 5)
        b = this.randomInt(-20, 20)
        c = this.randomInt(-20, 20)
        answer = this.randomInt(-10, 10)
        timer = 150
        break
    }

    const question = `Solve for x: ${a}x² + ${b}x + ${c} = 0 (find one solution)`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'quadratic_equation'
    }
  }

  private static generateSystemOfEquations(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let a: number, b: number, c: number, d: number, e: number, f: number
    let x: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        a = this.randomInt(1, 3)
        b = this.randomInt(1, 3)
        c = this.randomInt(1, 10)
        d = this.randomInt(1, 3)
        e = this.randomInt(1, 3)
        f = this.randomInt(1, 10)
        x = this.randomInt(1, 5)
        timer = 120
        break
      case 'medium':
        a = this.randomInt(1, 5)
        b = this.randomInt(1, 5)
        c = this.randomInt(1, 20)
        d = this.randomInt(1, 5)
        e = this.randomInt(1, 5)
        f = this.randomInt(1, 20)
        x = this.randomInt(1, 8)
        timer = 150
        break
      case 'hard':
        a = this.randomInt(1, 10)
        b = this.randomInt(1, 10)
        c = this.randomInt(1, 50)
        d = this.randomInt(1, 10)
        e = this.randomInt(1, 10)
        f = this.randomInt(1, 50)
        x = this.randomInt(1, 10)
        timer = 180
        break
    }

    const question = `Solve the system: ${a}x + ${b}y = ${c}, ${d}x + ${e}y = ${f}. What is the value of x?`
    const options = this.generateOptions(x, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(x.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'system_of_equations'
    }
  }

  // Generate geometry questions
  static generateGeometry(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    const types = ['area', 'perimeter', 'volume', 'angles']
    const type = types[Math.floor(Math.random() * types.length)]
    
    switch (type) {
      case 'area':
        return this.generateAreaQuestion(difficulty)
      case 'perimeter':
        return this.generatePerimeterQuestion(difficulty)
      case 'volume':
        return this.generateVolumeQuestion(difficulty)
      case 'angles':
        return this.generateAngleQuestion(difficulty)
      default:
        return this.generateAreaQuestion(difficulty)
    }
  }

  private static generateAreaQuestion(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    const shapes = ['rectangle', 'triangle', 'circle']
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    
    switch (shape) {
      case 'rectangle':
        return this.generateRectangleArea(difficulty)
      case 'triangle':
        return this.generateTriangleArea(difficulty)
      case 'circle':
        return this.generateCircleArea(difficulty)
      default:
        return this.generateRectangleArea(difficulty)
    }
  }

  private static generateRectangleArea(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let length: number, width: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        length = this.randomInt(2, 10)
        width = this.randomInt(2, 10)
        answer = length * width
        timer = 45
        break
      case 'medium':
        length = this.randomInt(5, 20)
        width = this.randomInt(5, 20)
        answer = length * width
        timer = 60
        break
      case 'hard':
        length = this.randomInt(10, 50)
        width = this.randomInt(10, 50)
        answer = length * width
        timer = 90
        break
    }

    const question = `What is the area of a rectangle with length ${length} and width ${width}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'rectangle_area'
    }
  }

  private static generateTriangleArea(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let base: number, height: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        base = this.randomInt(3, 10)
        height = this.randomInt(3, 10)
        answer = Math.round((base * height) / 2)
        timer = 45
        break
      case 'medium':
        base = this.randomInt(5, 20)
        height = this.randomInt(5, 20)
        answer = Math.round((base * height) / 2)
        timer = 60
        break
      case 'hard':
        base = this.randomInt(10, 50)
        height = this.randomInt(10, 50)
        answer = Math.round((base * height) / 2)
        timer = 90
        break
    }

    const question = `What is the area of a triangle with base ${base} and height ${height}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'triangle_area'
    }
  }

  private static generateCircleArea(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let radius: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        radius = this.randomInt(2, 10)
        answer = Math.round(Math.PI * radius * radius)
        timer = 60
        break
      case 'medium':
        radius = this.randomInt(5, 20)
        answer = Math.round(Math.PI * radius * radius)
        timer = 90
        break
      case 'hard':
        radius = this.randomInt(10, 50)
        answer = Math.round(Math.PI * radius * radius)
        timer = 120
        break
    }

    const question = `What is the area of a circle with radius ${radius}? (Use π ≈ 3.14)`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'circle_area'
    }
  }

  private static generatePerimeterQuestion(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let length: number, width: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        length = this.randomInt(3, 10)
        width = this.randomInt(3, 10)
        answer = 2 * (length + width)
        timer = 45
        break
      case 'medium':
        length = this.randomInt(5, 20)
        width = this.randomInt(5, 20)
        answer = 2 * (length + width)
        timer = 60
        break
      case 'hard':
        length = this.randomInt(10, 50)
        width = this.randomInt(10, 50)
        answer = 2 * (length + width)
        timer = 90
        break
    }

    const question = `What is the perimeter of a rectangle with length ${length} and width ${width}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'rectangle_perimeter'
    }
  }

  private static generateVolumeQuestion(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let length: number, width: number, height: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        length = this.randomInt(2, 8)
        width = this.randomInt(2, 8)
        height = this.randomInt(2, 8)
        answer = length * width * height
        timer = 60
        break
      case 'medium':
        length = this.randomInt(5, 15)
        width = this.randomInt(5, 15)
        height = this.randomInt(5, 15)
        answer = length * width * height
        timer = 90
        break
      case 'hard':
        length = this.randomInt(10, 30)
        width = this.randomInt(10, 30)
        height = this.randomInt(10, 30)
        answer = length * width * height
        timer = 120
        break
    }

    const question = `What is the volume of a rectangular prism with length ${length}, width ${width}, and height ${height}?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'rectangular_prism_volume'
    }
  }

  private static generateAngleQuestion(difficulty: 'easy' | 'medium' | 'hard'): MathQuestion {
    let angle1: number, angle2: number, answer: number
    let timer: number

    switch (difficulty) {
      case 'easy':
        angle1 = this.randomInt(30, 60)
        angle2 = this.randomInt(30, 60)
        answer = 180 - angle1 - angle2
        timer = 45
        break
      case 'medium':
        angle1 = this.randomInt(20, 80)
        angle2 = this.randomInt(20, 80)
        answer = 180 - angle1 - angle2
        timer = 60
        break
      case 'hard':
        angle1 = this.randomInt(10, 100)
        angle2 = this.randomInt(10, 100)
        answer = 180 - angle1 - angle2
        timer = 90
        break
    }

    const question = `In a triangle, two angles are ${angle1}° and ${angle2}°. What is the measure of the third angle?`
    const options = this.generateOptions(answer, difficulty)
    
    return {
      question_text: question,
      options,
      correct_answer: options.indexOf(answer.toString()),
      timer_seconds: timer,
      difficulty,
      question_type: 'triangle_angle'
    }
  }

  // Helper methods
  private static generateOptions(correctAnswer: number, difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const options = new Set<string>()
    options.add(correctAnswer.toString())

    let range: number
    switch (difficulty) {
      case 'easy':
        range = 5
        break
      case 'medium':
        range = 10
        break
      case 'hard':
        range = 20
        break
    }

    while (options.size < 4) {
      const wrongAnswer = correctAnswer + this.randomInt(-range, range)
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0) {
        options.add(wrongAnswer.toString())
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5)
  }

  private static generateFractionOptions(correctAnswer: string, difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const options = new Set<string>()
    options.add(correctAnswer)

    const [num, den] = correctAnswer.split('/').map(Number)
    let range: number
    switch (difficulty) {
      case 'easy':
        range = 2
        break
      case 'medium':
        range = 5
        break
      case 'hard':
        range = 10
        break
    }

    while (options.size < 4) {
      const wrongNum = num + this.randomInt(-range, range)
      const wrongDen = den + this.randomInt(-range, range)
      if (wrongNum > 0 && wrongDen > 0 && wrongNum !== num && wrongDen !== den) {
        options.add(`${wrongNum}/${wrongDen}`)
      }
    }

    return Array.from(options).sort(() => Math.random() - 0.5)
  }

  private static simplifyFraction(numerator: number, denominator: number): string {
    const gcd = this.gcd(numerator, denominator)
    const simplifiedNum = numerator / gcd
    const simplifiedDen = denominator / gcd
    
    if (simplifiedDen === 1) {
      return simplifiedNum.toString()
    }
    
    return `${simplifiedNum}/${simplifiedDen}`
  }

  private static addFractions(a: number, b: number, c: number, d: number): string {
    const numerator = a * d + c * b
    const denominator = b * d
    return this.simplifyFraction(numerator, denominator)
  }

  private static subtractFractions(a: number, b: number, c: number, d: number): string {
    const numerator = a * d - c * b
    const denominator = b * d
    return this.simplifyFraction(numerator, denominator)
  }

  private static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b)
  }

  // Main generator method
  static generateQuestions(
    count: number,
    categories: string[] = ['arithmetic', 'fractions', 'algebra', 'geometry'],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): MathQuestion[] {
    const questions: MathQuestion[] = []
    
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      
      switch (category) {
        case 'arithmetic':
          questions.push(this.generateArithmetic(difficulty))
          break
        case 'fractions':
          questions.push(this.generateFractions(difficulty))
          break
        case 'algebra':
          questions.push(this.generateAlgebra(difficulty))
          break
        case 'geometry':
          questions.push(this.generateGeometry(difficulty))
          break
        default:
          questions.push(this.generateArithmetic(difficulty))
      }
    }
    
    return questions
  }
}
