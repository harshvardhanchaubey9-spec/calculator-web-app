// Creative Calculator - script.js
(() => {
  const previewEl = document.getElementById("preview");
  const resultEl  = document.getElementById("result");
  const keys = document.querySelectorAll(".keys .btn");
  const themeToggle = document.getElementById("themeToggle");

  let expression = ""; // user's typed expression
  let lastResult = null;

  const updateDisplay = () => {
    previewEl.textContent = expression || "0";
    resultEl.textContent = lastResult === null ? "0" : String(lastResult);
  };

  // sanitize and evaluate safely (local usage)
  const evaluateExpression = (expr) => {
    // replace visual operators with JS equivalents if any
    let safe = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    // disallow letters to prevent accidental code execution via Function
    if (/[a-zA-Z]/.test(safe)) throw new Error("Invalid characters");
    // Allow digits, operators, parentheses, decimal and spaces only
    if (!/^[0-9+\-*/().\s]+$/.test(safe)) throw new Error("Invalid expression");
    // Use Function to evaluate; wrapped in try/catch
    // NOTE: For browser local calculator this is acceptable; for server side evaluate use a parser.
    // Prevent consecutive operators like ++ or ** that are invalid mathematically (except minus as unary)
    safe = safe.replace(/([+\-*/])\s*([+\-*/])/g, (m, a, b) => {
      // if second is minus allow (e.g., 5 * -3)
      if(b === "-") return a + b;
      return a; // drop duplicate
    });
    return Function(`"use strict"; return (${safe})`)();
  };

  // handles button clicks
  keys.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.value;
      const action = btn.dataset.action;

      if (action === "clear") {
        expression = "";
        lastResult = null;
      } else if (action === "back") {
        expression = expression.slice(0, -1);
      } else if (action === "equals") {
        try {
          if(!expression) return;
          const res = evaluateExpression(expression);
          if (Number.isFinite(res)) {
            lastResult = parseFloat(Number(res).toPrecision(12)); // trim floating noise
            expression = String(lastResult);
          } else {
            lastResult = "Error";
          }
        } catch (e) {
          lastResult = "Error";
        }
      } else if (val !== undefined) {
        // append value
        // prevent multiple dots in same number chunk
        if (val === ".") {
          // find last number token
          const tokens = expression.split(/[\+\-\*\/\(\)]/);
          const last = tokens[tokens.length - 1];
          if (last.includes(".")) return; // ignore second dot
          if (last === "") expression += "0"; // start "0."
        }
        expression += val;
      }

      updateDisplay();
    });
  });

  // keyboard support
  window.addEventListener("keydown", (e) => {
    const key = e.key;
    if ((key >= "0" && key <= "9") || ["+", "-", "*", "/", "(", ")", "."].includes(key)) {
      expression += key;
      updateDisplay();
      e.preventDefault();
    } else if (key === "Enter" || key === "=") {
      // evaluate
      try {
        if(!expression) return;
        const res = evaluateExpression(expression);
        if (Number.isFinite(res)) {
          lastResult = parseFloat(Number(res).toPrecision(12));
          expression = String(lastResult);
        } else lastResult = "Error";
      } catch {
        lastResult = "Error";
      }
      updateDisplay();
      e.preventDefault();
    } else if (key === "Backspace") {
      expression = expression.slice(0, -1);
      updateDisplay();
    } else if (key === "Escape") {
      expression = "";
      lastResult = null;
      updateDisplay();
    }
  });

  // theme toggle (light/dark)
  let light = false;
  themeToggle.addEventListener("click", () => {
    light = !light;
    if (light) {
      document.documentElement.style.setProperty("--bg1", "#f7fbff");
      document.documentElement.style.setProperty("--text", "#06202a");
      document.documentElement.style.setProperty("--muted", "rgba(6,32,42,0.7)");
      document.documentElement.style.setProperty("--card", "rgba(2,6,23,0.03)");
      themeToggle.textContent = "🌞";
    } else {
      document.documentElement.style.setProperty("--bg1", "#0f1724");
      document.documentElement.style.setProperty("--text", "#e6eef8");
      document.documentElement.style.setProperty("--muted", "rgba(230,238,248,0.6)");
      document.documentElement.style.setProperty("--card", "rgba(255,255,255,0.04)");
      themeToggle.textContent = "🌙";
    }
  });

  // initial
  updateDisplay();
})();
