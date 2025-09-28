export interface MathQuestion {
  question_text: string;
  options: string[];
  correct_answer: number;
  timer_seconds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: string;
  grade_level: number;
  language: 'french' | 'english';
}

export class MathQuestionGenerator {
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static randomFloat(min: number, max: number, decimals: number = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  // Grade-specific difficulty mapping for Lebanese curriculum
  private static getDifficultyForGrade(grade: number): 'easy' | 'medium' | 'hard' {
    if (grade <= 4) return 'easy';
    if (grade <= 8) return 'medium';
    return 'hard';
  }

  // Grade-specific number ranges for Lebanese curriculum
  private static getNumberRange(grade: number): { min: number; max: number } {
    if (grade <= 2) {
      return { min: 1, max: 10 };
    } else if (grade <= 4) {
      return { min: 1, max: 20 };
    } else if (grade <= 6) {
      return { min: 1, max: 50 };
    } else if (grade <= 8) {
      return { min: 1, max: 100 };
    } else if (grade <= 10) {
      return { min: 1, max: 500 }; // Reduced range for better performance
    } else {
      return { min: 1, max: 200 }; // Even smaller range for grade 11-12
    }
  }

  // Language-specific question templates
  private static getQuestionTemplate(category: string, grade: number, language: 'french' | 'english'): any {
    const templates = {
      arithmetic: {
        easy: {
          french: {
            addition: "Quelle est la somme de {a} et {b} ?",
            subtraction: "Quelle est la différence entre {a} et {b} ?",
            multiplication: "Combien font {a} × {b} ?",
            division: "Combien font {a} ÷ {b} ?"
          },
          english: {
            addition: "What is the sum of {a} and {b}?",
            subtraction: "What is the difference between {a} and {b}?",
            multiplication: "What is {a} × {b}?",
            division: "What is {a} ÷ {b}?"
          }
        },
        medium: {
          french: {
            addition: "Calculez {a} + {b} + {c}",
            subtraction: "Calculez {a} - {b} - {c}",
            multiplication: "Calculez {a} × {b} × {c}",
            division: "Calculez {a} ÷ {b} ÷ {c}"
          },
          english: {
            addition: "Calculate {a} + {b} + {c}",
            subtraction: "Calculate {a} - {b} - {c}",
            multiplication: "Calculate {a} × {b} × {c}",
            division: "Calculate {a} ÷ {b} ÷ {c}"
          }
        },
        hard: {
          french: {
            addition: "Résolvez: {a} + {b} × {c}",
            subtraction: "Résolvez: {a} - {b} × {c}",
            multiplication: "Résolvez: ({a} + {b}) × {c}",
            division: "Résolvez: ({a} + {b}) ÷ {c}"
          },
          english: {
            addition: "Solve: {a} + {b} × {c}",
            subtraction: "Solve: {a} - {b} × {c}",
            multiplication: "Solve: ({a} + {b}) × {c}",
            division: "Solve: ({a} + {b}) ÷ {c}"
          }
        }
      },
      fractions: {
        easy: {
          french: {
            addition: "Quelle est la somme de {a}/{b} et {c}/{d} ?",
            subtraction: "Quelle est la différence entre {a}/{b} et {c}/{d} ?",
            multiplication: "Combien font {a}/{b} × {c}/{d} ?",
            division: "Combien font {a}/{b} ÷ {c}/{d} ?"
          },
          english: {
            addition: "What is the sum of {a}/{b} and {c}/{d}?",
            subtraction: "What is the difference between {a}/{b} and {c}/{d}?",
            multiplication: "What is {a}/{b} × {c}/{d}?",
            division: "What is {a}/{b} ÷ {c}/{d}?"
          }
        },
        medium: {
          french: {
            addition: "Calculez {a}/{b} + {c}/{d}",
            subtraction: "Calculez {a}/{b} - {c}/{d}",
            multiplication: "Calculez {a}/{b} × {c}/{d}",
            division: "Calculez {a}/{b} ÷ {c}/{d}"
          },
          english: {
            addition: "Calculate {a}/{b} + {c}/{d}",
            subtraction: "Calculate {a}/{b} - {c}/{d}",
            multiplication: "Calculate {a}/{b} × {c}/{d}",
            division: "Calculate {a}/{b} ÷ {c}/{d}"
          }
        },
        hard: {
          french: {
            addition: "Résolvez: {a}/{b} + {c}/{d} + {e}/{f}",
            subtraction: "Résolvez: {a}/{b} - {c}/{d} - {e}/{f}",
            multiplication: "Résolvez: ({a}/{b} + {c}/{d}) × {e}/{f}",
            division: "Résolvez: ({a}/{b} + {c}/{d}) ÷ {e}/{f}"
          },
          english: {
            addition: "Solve: {a}/{b} + {c}/{d} + {e}/{f}",
            subtraction: "Solve: {a}/{b} - {c}/{d} - {e}/{f}",
            multiplication: "Solve: ({a}/{b} + {c}/{d}) × {e}/{f}",
            division: "Solve: ({a}/{b} + {c}/{d}) ÷ {e}/{f}"
          }
        }
      },
      algebra: {
        easy: {
          french: {
            linear: "Résolvez: {a}x + {b} = {c}",
            quadratic: "Résolvez: x² + {a}x + {b} = 0",
            system: "Résolvez le système: {a}x + {b}y = {c}, {d}x + {e}y = {f}"
          },
          english: {
            linear: "Solve: {a}x + {b} = {c}",
            quadratic: "Solve: x² + {a}x + {b} = 0",
            system: "Solve the system: {a}x + {b}y = {c}, {d}x + {e}y = {f}"
          }
        },
        medium: {
          french: {
            linear: "Résolvez: {a}x + {b} = {c}x + {d}",
            quadratic: "Résolvez: {a}x² + {b}x + {c} = 0",
            system: "Résolvez le système: {a}x + {b}y = {c}, {d}x + {e}y = {f}"
          },
          english: {
            linear: "Solve: {a}x + {b} = {c}x + {d}",
            quadratic: "Solve: {a}x² + {b}x + {c} = 0",
            system: "Solve the system: {a}x + {b}y = {c}, {d}x + {e}y = {f}"
          }
        },
        hard: {
          french: {
            linear: "Résolvez: {a}x + {b} = {c}x + {d}",
            quadratic: "Résolvez: {a}x² + {b}x + {c} = 0",
            system: "Résolvez le système: {a}x + {b}y = {c}, {d}x + {e}y = {f}"
          },
          english: {
            linear: "Solve: {a}x + {b} = {c}x + {d}",
            quadratic: "Solve: {a}x² + {b}x + {c} = 0",
            system: "Solve the system: {a}x + {b}y = {c}, {d}x + {e}y = {f}"
          }
        }
      },
      geometry: {
        easy: {
          french: {
            area: "Quelle est l'aire d'un rectangle de longueur {a} et de largeur {b} ?",
            perimeter: "Quel est le périmètre d'un rectangle de longueur {a} et de largeur {b} ?",
            volume: "Quel est le volume d'un cube de côté {a} ?"
          },
          english: {
            area: "What is the area of a rectangle with length {a} and width {b}?",
            perimeter: "What is the perimeter of a rectangle with length {a} and width {b}?",
            volume: "What is the volume of a cube with side {a}?"
          }
        },
        medium: {
          french: {
            area: "Calculez l'aire d'un triangle de base {a} et de hauteur {b}",
            perimeter: "Calculez le périmètre d'un cercle de rayon {a}",
            volume: "Calculez le volume d'un cylindre de rayon {a} et de hauteur {b}"
          },
          english: {
            area: "Calculate the area of a triangle with base {a} and height {b}",
            perimeter: "Calculate the perimeter of a circle with radius {a}",
            volume: "Calculate the volume of a cylinder with radius {a} and height {b}"
          }
        },
        hard: {
          french: {
            area: "Calculez l'aire d'un trapèze de bases {a} et {b} et de hauteur {c}",
            perimeter: "Calculez le périmètre d'un polygone régulier de {a} côtés de longueur {b}",
            volume: "Calculez le volume d'une sphère de rayon {a}"
          },
          english: {
            area: "Calculate the area of a trapezoid with bases {a} and {b} and height {c}",
            perimeter: "Calculate the perimeter of a regular polygon with {a} sides of length {b}",
            volume: "Calculate the volume of a sphere with radius {a}"
          }
        }
      }
    };

    return (templates as any)[category][this.getDifficultyForGrade(grade)][language];
  }

  // Generate arithmetic questions based on grade and language
  static generateArithmetic(grade: number, language: 'french' | 'english'): MathQuestion {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const operation = operations[this.randomInt(0, operations.length - 1)];
    const range = this.getNumberRange(grade);
    
    let a, b, c, question, correctAnswer, timer;
    
    if (operation === 'addition') {
      a = this.randomInt(range.min, range.max);
      b = this.randomInt(range.min, range.max);
      c = grade > 4 ? this.randomInt(range.min, range.max) : 0;
      
      if (c > 0) {
        question = this.getQuestionTemplate('arithmetic', grade, language).addition
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString());
        correctAnswer = a + b + c;
      } else {
        // Use easy template for simple addition
        const easyTemplate = this.getQuestionTemplate('arithmetic', 4, language).addition; // Force easy template
        question = easyTemplate
          .replace('{a}', a.toString())
          .replace('{b}', b.toString());
        correctAnswer = a + b;
      }
      timer = grade <= 4 ? 30 : grade <= 8 ? 45 : 60;
    } else if (operation === 'subtraction') {
      a = this.randomInt(range.min, range.max);
      b = this.randomInt(range.min, a);
      c = grade > 4 ? this.randomInt(range.min, range.max) : 0;
      
      if (c > 0) {
        question = this.getQuestionTemplate('arithmetic', grade, language).subtraction
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString());
        correctAnswer = a - b - c;
      } else {
        // Use easy template for simple subtraction
        const easyTemplate = this.getQuestionTemplate('arithmetic', 4, language).subtraction; // Force easy template
        question = easyTemplate
          .replace('{a}', a.toString())
          .replace('{b}', b.toString());
        correctAnswer = a - b;
      }
      timer = grade <= 4 ? 30 : grade <= 8 ? 45 : 60;
    } else if (operation === 'multiplication') {
      a = this.randomInt(range.min, Math.min(range.max, 12));
      b = this.randomInt(range.min, Math.min(range.max, 12));
      c = grade > 6 ? this.randomInt(range.min, Math.min(range.max, 12)) : 0;
      
      if (c > 0) {
        question = this.getQuestionTemplate('arithmetic', grade, language).multiplication
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString());
        correctAnswer = a * b * c;
      } else {
        // Use easy template for simple multiplication
        const easyTemplate = this.getQuestionTemplate('arithmetic', 4, language).multiplication; // Force easy template
        question = easyTemplate
          .replace('{a}', a.toString())
          .replace('{b}', b.toString());
        correctAnswer = a * b;
      }
      timer = grade <= 4 ? 30 : grade <= 8 ? 45 : 60;
    } else { // division
      b = this.randomInt(2, Math.min(range.max, 12));
      a = b * this.randomInt(range.min, Math.min(range.max, 12));
      c = grade > 6 ? this.randomInt(2, Math.min(range.max, 12)) : 0;
      
      if (c > 0) {
        question = this.getQuestionTemplate('arithmetic', grade, language).division
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString());
        correctAnswer = a / b / c;
      } else {
        // Use easy template for simple division
        const easyTemplate = this.getQuestionTemplate('arithmetic', 4, language).division; // Force easy template
        question = easyTemplate
          .replace('{a}', a.toString())
          .replace('{b}', b.toString());
        correctAnswer = a / b;
      }
      timer = grade <= 4 ? 30 : grade <= 8 ? 45 : 60;
    }

    const options = this.generateOptions(correctAnswer, operation);
    const correctIndex = options.indexOf(correctAnswer.toString());

    return {
      question_text: question,
      options,
      correct_answer: correctIndex,
      timer_seconds: timer,
      difficulty: this.getDifficultyForGrade(grade),
      question_type: operation,
      grade_level: grade,
      language
    };
  }

  // Generate fraction questions based on grade and language
  static generateFractions(grade: number, language: 'french' | 'english'): MathQuestion {
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const operation = operations[this.randomInt(0, operations.length - 1)];
    
    let a, b, c, d, e, f, question, correctAnswer, timer;
    
    if (operation === 'addition') {
      a = this.randomInt(1, 10);
      b = this.randomInt(2, 10);
      c = this.randomInt(1, 10);
      d = this.randomInt(2, 10);
      e = grade > 6 ? this.randomInt(1, 10) : 0;
      f = grade > 6 ? this.randomInt(2, 10) : 0;
      
      if (e > 0 && f > 0) {
        question = this.getQuestionTemplate('fractions', grade, language).addition
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString())
          .replace('{e}', e.toString())
          .replace('{f}', f.toString());
        correctAnswer = (a/b) + (c/d) + (e/f);
      } else {
        question = this.getQuestionTemplate('fractions', grade, language).addition
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString());
        correctAnswer = (a/b) + (c/d);
      }
      timer = grade <= 4 ? 45 : grade <= 8 ? 60 : 90;
    } else if (operation === 'subtraction') {
      a = this.randomInt(1, 10);
      b = this.randomInt(2, 10);
      c = this.randomInt(1, 10);
      d = this.randomInt(2, 10);
      e = grade > 6 ? this.randomInt(1, 10) : 0;
      f = grade > 6 ? this.randomInt(2, 10) : 0;
      
      if (e > 0 && f > 0) {
        question = this.getQuestionTemplate('fractions', grade, language).subtraction
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString())
          .replace('{e}', e.toString())
          .replace('{f}', f.toString());
        correctAnswer = (a/b) - (c/d) - (e/f);
      } else {
        question = this.getQuestionTemplate('fractions', grade, language).subtraction
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString());
        correctAnswer = (a/b) - (c/d);
      }
      timer = grade <= 4 ? 45 : grade <= 8 ? 60 : 90;
    } else if (operation === 'multiplication') {
      a = this.randomInt(1, 10);
      b = this.randomInt(2, 10);
      c = this.randomInt(1, 10);
      d = this.randomInt(2, 10);
      e = grade > 6 ? this.randomInt(1, 10) : 0;
      f = grade > 6 ? this.randomInt(2, 10) : 0;
      
      if (e > 0 && f > 0) {
        question = this.getQuestionTemplate('fractions', grade, language).multiplication
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString())
          .replace('{e}', e.toString())
          .replace('{f}', f.toString());
        correctAnswer = (a/b) * (c/d) * (e/f);
      } else {
        question = this.getQuestionTemplate('fractions', grade, language).multiplication
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString());
        correctAnswer = (a/b) * (c/d);
      }
      timer = grade <= 4 ? 45 : grade <= 8 ? 60 : 90;
    } else { // division
      a = this.randomInt(1, 10);
      b = this.randomInt(2, 10);
      c = this.randomInt(1, 10);
      d = this.randomInt(2, 10);
      e = grade > 6 ? this.randomInt(1, 10) : 0;
      f = grade > 6 ? this.randomInt(2, 10) : 0;
      
      if (e > 0 && f > 0) {
        question = this.getQuestionTemplate('fractions', grade, language).division
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString())
          .replace('{e}', e.toString())
          .replace('{f}', f.toString());
        correctAnswer = (a/b) / (c/d) / (e/f);
      } else {
        question = this.getQuestionTemplate('fractions', grade, language).division
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString());
        correctAnswer = (a/b) / (c/d);
      }
      timer = grade <= 4 ? 45 : grade <= 8 ? 60 : 90;
    }

    const options = this.generateFractionOptions(correctAnswer);
    const correctIndex = options.findIndex(opt => Math.abs(parseFloat(opt) - correctAnswer) < 0.001);

    return {
      question_text: question,
      options,
      correct_answer: correctIndex,
      timer_seconds: timer,
      difficulty: this.getDifficultyForGrade(grade),
      question_type: `fraction_${operation}`,
      grade_level: grade,
      language
    };
  }

  // Generate algebra questions based on grade and language
  static generateAlgebra(grade: number, language: 'french' | 'english'): MathQuestion {
    const types = ['linear', 'quadratic', 'system'];
    const type = types[this.randomInt(0, types.length - 1)];
    
    let question, correctAnswer, options, timer;
    
    if (type === 'linear') {
      const a = this.randomInt(1, 10);
      const b = this.randomInt(1, 20);
      const c = this.randomInt(1, 20);
      const d = grade > 6 ? this.randomInt(1, 10) : 0;
      
      if (d > 0) {
        question = this.getQuestionTemplate('algebra', grade, language).linear
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString())
          .replace('{d}', d.toString());
        correctAnswer = (c - b) / (a - d);
      } else {
        question = this.getQuestionTemplate('algebra', grade, language).linear
          .replace('{a}', a.toString())
          .replace('{b}', b.toString())
          .replace('{c}', c.toString());
        correctAnswer = (c - b) / a;
      }
      
      options = this.generateOptions(correctAnswer, 'linear');
      timer = grade <= 4 ? 60 : grade <= 8 ? 90 : 120;
    } else if (type === 'quadratic') {
      const a = this.randomInt(1, 5);
      const b = this.randomInt(1, 10);
      const c = this.randomInt(1, 10);
      
      question = this.getQuestionTemplate('algebra', grade, language).quadratic
        .replace('{a}', a.toString())
        .replace('{b}', b.toString())
        .replace('{c}', c.toString());
      
      // Simple quadratic formula for x² + bx + c = 0
      const discriminant = b * b - 4 * a * c;
      if (discriminant >= 0) {
        correctAnswer = (-b + Math.sqrt(discriminant)) / (2 * a);
      } else {
        correctAnswer = 0; // No real solutions
      }
      
      options = this.generateOptions(correctAnswer, 'quadratic');
      timer = grade <= 4 ? 90 : grade <= 8 ? 120 : 150;
    } else { // system
      const a = this.randomInt(1, 5);
      const b = this.randomInt(1, 5);
      const c = this.randomInt(1, 20);
      const d = this.randomInt(1, 5);
      const e = this.randomInt(1, 5);
      const f = this.randomInt(1, 20);
      
      question = this.getQuestionTemplate('algebra', grade, language).system
        .replace('{a}', a.toString())
        .replace('{b}', b.toString())
        .replace('{c}', c.toString())
        .replace('{d}', d.toString())
        .replace('{e}', e.toString())
        .replace('{f}', f.toString());
      
      // Simple 2x2 system solution
      const det = a * e - b * d;
      if (det !== 0) {
        const x = (c * e - b * f) / det;
        // const y = (a * f - c * d) / det; // y value not needed for this question
        correctAnswer = x; // Return x value
      } else {
        correctAnswer = 0; // No unique solution
      }
      
      options = this.generateOptions(correctAnswer, 'system');
      timer = grade <= 4 ? 120 : grade <= 8 ? 150 : 180;
    }

    const correctIndex = options.findIndex(opt => Math.abs(parseFloat(opt) - correctAnswer) < 0.001);

    return {
      question_text: question,
      options,
      correct_answer: correctIndex,
      timer_seconds: timer,
      difficulty: this.getDifficultyForGrade(grade),
      question_type: `${type}_equation`,
      grade_level: grade,
      language
    };
  }

  // Generate geometry questions based on grade and language
  static generateGeometry(grade: number, language: 'french' | 'english'): MathQuestion {
    const types = ['area', 'perimeter', 'volume'];
    const type = types[this.randomInt(0, types.length - 1)];
    
    let question, correctAnswer, options, timer;
    
    if (type === 'area') {
      if (grade <= 4) {
        // Rectangle area
        const length = this.randomInt(1, 10);
        const width = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).area
          .replace('{a}', length.toString())
          .replace('{b}', width.toString());
        correctAnswer = length * width;
        timer = 45;
      } else if (grade <= 8) {
        // Triangle area
        const base = this.randomInt(1, 10);
        const height = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).area
          .replace('{a}', base.toString())
          .replace('{b}', height.toString());
        correctAnswer = (base * height) / 2;
        timer = 60;
      } else {
        // Trapezoid area
        const base1 = this.randomInt(1, 10);
        const base2 = this.randomInt(1, 10);
        const height = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).area
          .replace('{a}', base1.toString())
          .replace('{b}', base2.toString())
          .replace('{c}', height.toString());
        correctAnswer = ((base1 + base2) * height) / 2;
        timer = 90;
      }
    } else if (type === 'perimeter') {
      if (grade <= 4) {
        // Rectangle perimeter
        const length = this.randomInt(1, 10);
        const width = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).perimeter
          .replace('{a}', length.toString())
          .replace('{b}', width.toString());
        correctAnswer = 2 * (length + width);
        timer = 45;
      } else if (grade <= 8) {
        // Circle perimeter
        const radius = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).perimeter
          .replace('{a}', radius.toString());
        correctAnswer = 2 * Math.PI * radius;
        timer = 60;
      } else {
        // Regular polygon perimeter
        const sides = this.randomInt(3, 8);
        const sideLength = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).perimeter
          .replace('{a}', sides.toString())
          .replace('{b}', sideLength.toString());
        correctAnswer = sides * sideLength;
        timer = 90;
      }
    } else { // volume
      if (grade <= 4) {
        // Cube volume
        const side = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).volume
          .replace('{a}', side.toString());
        correctAnswer = side * side * side;
        timer = 60;
      } else if (grade <= 8) {
        // Cylinder volume
        const radius = this.randomInt(1, 10);
        const height = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).volume
          .replace('{a}', radius.toString())
          .replace('{b}', height.toString());
        correctAnswer = Math.PI * radius * radius * height;
        timer = 90;
      } else {
        // Sphere volume
        const radius = this.randomInt(1, 10);
        question = this.getQuestionTemplate('geometry', grade, language).volume
          .replace('{a}', radius.toString());
        correctAnswer = (4/3) * Math.PI * radius * radius * radius;
        timer = 120;
      }
    }

    options = this.generateOptions(correctAnswer, 'geometry');
    const correctIndex = options.findIndex(opt => Math.abs(parseFloat(opt) - correctAnswer) < 0.001);

    return {
      question_text: question,
      options,
      correct_answer: correctIndex,
      timer_seconds: timer,
      difficulty: this.getDifficultyForGrade(grade),
      question_type: `${type}_geometry`,
      grade_level: grade,
      language
    };
  }

  // Helper methods
  private static generateOptions(correctAnswer: number, operation: string): string[] {
    const options = new Set<string>();
    options.add(correctAnswer.toString());
    
    // Generate wrong options based on operation
    while (options.size < 4) {
      let wrongAnswer;
      if (operation === 'addition') {
        wrongAnswer = correctAnswer + this.randomInt(-10, 10);
      } else if (operation === 'subtraction') {
        wrongAnswer = correctAnswer + this.randomInt(-10, 10);
      } else if (operation === 'multiplication') {
        wrongAnswer = correctAnswer + this.randomInt(-20, 20);
      } else if (operation === 'division') {
        wrongAnswer = correctAnswer + this.randomInt(-5, 5);
      } else if (operation === 'linear') {
        wrongAnswer = correctAnswer + this.randomInt(-5, 5);
      } else if (operation === 'quadratic') {
        wrongAnswer = correctAnswer + this.randomInt(-10, 10);
      } else if (operation === 'system') {
        wrongAnswer = correctAnswer + this.randomInt(-5, 5);
      } else if (operation === 'geometry') {
        wrongAnswer = correctAnswer + this.randomInt(-10, 10);
      } else {
        wrongAnswer = correctAnswer + this.randomInt(-10, 10);
      }
      
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0) {
        options.add(wrongAnswer.toString());
      }
    }
    
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  private static generateFractionOptions(correctAnswer: number): string[] {
    const options = new Set<string>();
    options.add(correctAnswer.toFixed(2));
    
    while (options.size < 4) {
      const wrongAnswer = correctAnswer + this.randomFloat(-2, 2, 2);
      if (Math.abs(wrongAnswer - correctAnswer) > 0.01) {
        options.add(wrongAnswer.toFixed(2));
      }
    }
    
    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  // Main generator method with grade and language support
  static generateQuestions(
    count: number,
    grade: number,
    language: 'french' | 'english',
    categories: string[] = ['arithmetic', 'fractions', 'algebra', 'geometry']
  ): MathQuestion[] {
    const questions: MathQuestion[] = [];
    const questionsPerCategory = Math.ceil(count / categories.length);
    
    for (const category of categories) {
      for (let i = 0; i < questionsPerCategory && questions.length < count; i++) {
        let question: MathQuestion;
        
        switch (category) {
          case 'arithmetic':
            question = this.generateArithmetic(grade, language);
            break;
          case 'fractions':
            question = this.generateFractions(grade, language);
            break;
          case 'algebra':
            question = this.generateAlgebra(grade, language);
            break;
          case 'geometry':
            question = this.generateGeometry(grade, language);
            break;
          default:
            question = this.generateArithmetic(grade, language);
        }
        
        questions.push(question);
      }
    }
    
    return questions.slice(0, count);
  }
}
