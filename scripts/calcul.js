/// --------------------------------------------------------------------------------------------- ///
/// La fonction de normalisation a été trouvée sur internet puis modifiée avec ChatGPT en partie. ///
/// J'ai codé tous le reste de moi-même.                                                          /// 
/// --------------------------------------------------------------------------------------------- ///

// Permet de normaliser une fonction avec des parenthèses.
  // L'equation devient donc beaucoup plus simple à traiter parce qu'on a un couple de parenthèses par operator - on va ensuite se servir de ça dans decompose.
function normalizeExpression(expression) {
    function shuntingYard(input) {
      const output = [];
      const stack = [];
      const operators = { '+': 1, '-': 1, '*': 2, '/': 2 };
      const functions = ['sqrt', 'cos', 'sin', 'exp', 'log'];
  
      for (let token of input) {
        if (!isNaN(parseFloat(token)) || token === 'pi') {
          output.push(token);
        } else if (functions.includes(token)) {
          stack.push(token);
        } else if (token in operators) {
          while (
            stack.length &&
            (functions.includes(stack[stack.length - 1]) ||
              operators[token] <= operators[stack[stack.length - 1]])
          ) {
            output.push(stack.pop());
          }
          stack.push(token);
        } else if (token === '(') {
          stack.push(token);
        } else if (token === ')') {
          while (stack.length && stack[stack.length - 1] !== '(') {
            output.push(stack.pop());
          }
          stack.pop();
          while (functions.includes(stack[stack.length - 1])) {
            output.push(stack.pop());
          }
        }
      }
  
      while (stack.length) {
        output.push(stack.pop());
      }
  
      return output;
    }
  
    const tokens = expression.match(/([0-9]+|pi|sqrt|cos|sin|exp|log|[-+*/()])/g) || [];
    const postfixTokens = shuntingYard(tokens);
  
    const stack = [];
    for (let token of postfixTokens) {
      if (!isNaN(parseFloat(token)) || token === 'pi') {
        stack.push(token);
      } else if (token in Math) {
        const operand = stack.pop();
        stack.push(`${token}(${operand})`);
      } else {
        const operand2 = stack.pop();
        const operand1 = stack.pop();
        stack.push(`(${operand1}${token}${operand2})`);
      }
    }  
    return stack[0];
}

function addMultiplicationOperator(expression) {
  expression = expression.replace(/(\d+)([a-zA-Z(])/g, '$1*$2');
  expression = expression.replace(/([a-zA-Z)])(\d+)/g, '$1*$2');
  expression = expression.replace(/([)])\s*([a-zA-Z(])/g, '$1*$2');
  expression = expression.replace(/([0-9)])\s*([(])/g, '$1*$2');
  
  return expression;
}

// Test si un caractère est un operator valide.
function isOperator(operator){
    switch(operator){
        case("+"):
            return true;
        case("/"):
            return true;
        case("*"):
            return true;
        case("-"):
            return true;
    }
    return false;
}

// Input  = equation
// Output = n1/n2 : deux sub-equations tirés de l'equation ainsi que l'opérateur qui lie les deux
  // On se sert du fait que la chaîne normalisée ait un opérateur par couple de parenthèse ( 3 + (6 * 5)) - on fait donc un stack et on repère la parenthèse principale du calcul
function decompose(equation){
  let tracker = 0;
  let stack = "";
  let operator = "";
  let left;
  let right;
  [...equation].forEach(function(char) {
    if(char == '('){
      if(tracker > 0){
        tracker++;
        stack += char;
      }
      else{
        tracker++;
      }
    }
    else if(char == ')'){
      if(tracker > 0){
        tracker--;
        stack += char;
      }
      else{
        tracker--;
      }
    }
    else if(isOperator(char) && tracker == 1){
      operator = char;
      left = stack;
      stack = "";
    }
    else{
      stack += char;
    }
  });
  right = stack.slice(0, stack.length - 1);
  return {"equations" : [left,right], "operator" : operator};
}

function getFunction(equation){
  if(equation.slice(0,4) == "sqrt"){
    return "sqrt";
  }
  else if(equation.slice(0,3) == "cos"){
    return "cos";
  }
  else if(equation.slice(0,3) == "sin"){
    return "sin";
  }
  else if(equation.slice(0,3) == "log"){
    return "log";
  }
  else if(equation.slice(0,3) == "exp"){
    return "exp";
  }
  return false;
}

// Permet de véirifier si l'equation est une fonction parmis : sqrt, cos, sin, log, exp
  // si le tracker de parenthèse détecte un fermeture et
function isFunction(equation){
  let func = getFunction(equation);
  if(!func){
    return false;
  }

  let tracker = 0;
  let open = false;
  let valide = true;

  for(var index = 0 ; index < equation.length; index++){
    let char = equation[index];
    if(char == '('){
      tracker++;
        open = true;
    }
    else if(char == ')'){
      tracker--;
    }
    // Si la première parenthèse est ouverte, le tracker est à 0 mais ce n'est pas le dernier char
    if(open && tracker < 1 && index < equation.length - 1){
      return false;
    }
  }
  return func;
}

// Résout une équation mais en appliquant une fonction dessus - on appelle resolve sur le contenu de la parenthèse puis on applique la fonction sur le resultat .
function resolveFunction(equation){
  let func = isFunction(equation);
  console.log("Resolve Func : ",equation, func);
  if(func){
    let EquationParent = equation.slice(func.length, equation.length);
    let res = resolve(EquationParent);
    switch (func) {
      case "sqrt":
        return Math.sqrt(res);
      case "cos":
        return Math.cos(res);
      case "sin":
        return Math.sin(res);
      case "log":
        return Math.log(res);
      case "exp":
        return Math.exp(res);
      default:
        return false;
    }
  }
  else{
    return false;
  }
}

// Permet de résoudre un calcul avec deux floats et un opérateur de base.
function resolveOperators(operator, values){
  switch(operator){
    case("+"):
        return values[0] + values[1];
    case("/"):
      if(values[1] == 0){
        return 0;
      }
      else{
        return values[0] / values[1];
      }
    case("*"):
    return values[0] * values[1];
    case("-"):
    return values[0] - values[1];
  }
  return false;
}

// Permet de résoudre une equation
function resolve(equation){
  console.log("Resolve : ",equation);
  // Normalise l'equation avec des parenthèses - on aura un couple de parenthèses par opérateur.
  // Si c'était un graphe on aurait un arbre avec des sommets représentant les equations - des relations eqution/subequation.
  // Chaque equation aurait deux subequations.
  equation = addMultiplicationOperator(equation);
  equation = normalizeExpression(equation);
  // Gère pi.
  if(equation == "pi" || equation == "(pi)"){
    return parseFloat(Math.PI);
  }
  // Gère les valeurs qui sont des chiffres/nombres floats ou int
  if(/^[0-9.()]+$/.test(equation)){
    return parseFloat(equation.replace(/[^\d.]/g, ''));
  }
  // Permet de gérer les fonctions (exp, log etc)
  if(isFunction(equation)){
    return resolveFunction(equation);
  }
  // On décompose l'équation en deux sous equations : on obtient l'equation A, l'equation B ainsi que l'opérateur (+,-,*,/) qui lie les deux.
  let divide = decompose(equation);
  console.log("Resolve : ",divide);
  let results = [];
  // On va résoudre les deux sous equations.
  divide.equations.forEach(function(equation) {
    res = resolve(equation);
    results.push(res);
  });
  // Résout l'equation
  return resolveOperators(divide.operator, results);
}

// resolveFunction mais cette fois on intègre la sauvegarde dans Redis
async function resolveFunctionRedis(equation, redis, knownEquation, unknownEquation){
  let func = isFunction(equation);
  console.log("Resolve Func : ",equation, func);
  if(func){
    let EquationParent = equation.slice(func.length, equation.length);
    let res = await resolveRedis(EquationParent, redis, knownEquation, unknownEquation);
    switch (func) {
      case "sqrt":
        return Math.sqrt(res);
      case "cos":
        return Math.cos(res);
      case "sin":
        return Math.sin(res);
      case "log":
        return Math.log(res);
      case "exp":
        return Math.exp(res);
      default:
        return false;
    }
  }
  else{
    return false;
  }
}

//Version modifié de resolve prenant en compte les sauvegardes dans la base
async function resolveRedis(equation, redis, knownEquation, unknownEquation){
  console.log("Resolve : ",equation);
  equation = addMultiplicationOperator(equation);
  equation = normalizeExpression(equation);
  if(await redis.get(equation)){
    console.log("KNOWN :", equation);
    var resKnown = await redis.get(equation);
    knownEquation.set(equation, resKnown);
    return resKnown;
  }

  // Normalise l'equation avec des parenthèses - on aura un couple de parenthèses par opérateur.
  // Si c'était un graphe on aurait un arbre avec des sommets représentant les equations - des relations eqution/subequation.
  // Chaque equation aurait deux subequations.  
  // Gère pi.
  if(equation == "pi" || equation == "(pi)"){
    return parseFloat(Math.PI);
  }
  
  // Gère les valeurs qui sont des chiffres/nombres floats ou int
  if(/^[0-9.()]+$/.test(equation)){
    return parseFloat(equation.replace(/[^\d.]/g, ''));
  }
  
  // Permet de gérer les fonctions (exp, log etc)
  if(isFunction(equation)){
    var res = await resolveFunctionRedis(equation, redis, knownEquation, unknownEquation);
    try {await redis.set(equation, res);}catch(err){}
    unknownEquation.set(equation, res);
    console.log("Unknown : ", unknownEquation);
    return res;
  }
  
  // On décompose l'équation en deux sous equations : on obtient l'equation A, l'equation B ainsi que l'opérateur (+,-,*,/) qui lie les deux.
  let divide = decompose(equation);
  console.log("Resolve : ",divide);
  let results = [];
  
  // On va résoudre les deux sous equations.
  for(var index = 0 ; index < divide.equations.length; index++){
    try{  
      res = await resolveRedis(divide.equations[index], redis, knownEquation, unknownEquation);
      results.push(res);
    }catch(err){}
  }
  // Résout une equation avec 2 floats et un operator.
  var res = resolveOperators(divide.operator, results);
  await redis.set(equation, res);
  unknownEquation.set(equation, res);
  return res;
}

module.exports.job = async (equation, redis) => {
  let knownEquation = new Map();
  let unknownEquation = new Map();
  let r = await resolveRedis(equation, redis, knownEquation, unknownEquation);
  return  {"res" : r, "equation" : equation, "known" : knownEquation, "unknown" : unknownEquation};
}