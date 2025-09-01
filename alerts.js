// alerts.js (versión robusta para depuración)
console.log('alerts.js cargado ->', new Date().toISOString());

document.addEventListener('DOMContentLoaded', function () {
  try {
    const tempMax = document.getElementById('tempMax');
    const humidityMin = document.getElementById('humidityMin');
    const phMin = document.getElementById('phMin');

    // Buscamos el botón dentro de .alert-config (fallbacks)
    const btnSimular =
      document.querySelector('.alert-config button') ||
      document.querySelector('.alert-config .btn-primary') ||
      document.querySelector('button[type="button"], button');

    let alertList = document.querySelector('.alert-list');

    // Validaciones iniciales (si faltan inputs, detenemos y avisamos)
    if (!tempMax || !humidityMin || !phMin) {
      console.error('FATAL: falta uno o más inputs (tempMax, humidityMin, phMin):',
        { tempMax: !!tempMax, humidityMin: !!humidityMin, phMin: !!phMin });

      const target = document.querySelector('.alert-config') || document.body;
      const notice = document.createElement('div');
      notice.style.cssText = 'background:#ef4444;color:#fff;padding:10px;border-radius:8px;margin-bottom:10px;font-weight:600';
      notice.textContent = 'JS: Error — faltan inputs (tempMax, humidityMin o phMin). Revisa ids en el HTML y la consola.';
      target.prepend(notice);
      return;
    }

    if (!btnSimular) {
      console.error('No se encontró el botón "Simular Alerta" dentro de .alert-config.');
      const target = document.querySelector('.alert-config') || document.body;
      const notice = document.createElement('div');
      notice.style.cssText = 'background:#f59e0b;color:#111;padding:10px;border-radius:8px;margin-bottom:10px;font-weight:600';
      notice.textContent = 'JS: Aviso — no se encontró el botón dentro de .alert-config. Comprueba que exista un <button> en esa sección.';
      target.prepend(notice);
      return;
    }

    // Si no existe .alert-list, lo creamos temporalmente para mostrar resultados
    if (!alertList) {
      console.warn('.alert-list no encontrada — se creará temporalmente para mostrar resultado.');
      const display = document.querySelector('.alert-display');
      alertList = document.createElement('div');
      alertList.className = 'alert-list';
      if (display) display.appendChild(alertList);
      else document.body.appendChild(alertList);
    }

    // Habilitar/Deshabilitar botón según inputs
    function validarInputs() {
      if (tempMax.value !== '' && humidityMin.value !== '' && phMin.value !== '') {
        btnSimular.disabled = false;
        btnSimular.classList.remove('btn-disabled');
      } else {
        btnSimular.disabled = true;
        btnSimular.classList.add('btn-disabled');
      }
    }
    [tempMax, humidityMin, phMin].forEach(i => i.addEventListener('input', validarInputs));
    validarInputs(); // estado inicial

    // Simulación de valores de sensores
    function obtenerValoresActuales() {
      return {
        temperatura: Math.floor(Math.random() * 50),
        humedad: Math.floor(Math.random() * 100),
        ph: (Math.random() * 14).toFixed(1)
      };
    }

    // Construir un item de alerta y agregar arriba
    function crearAlerta(tipo, titulo, mensaje) {
      const item = document.createElement('div');
      item.className = `alert-item ${tipo}`;
      const icono = tipo === 'critical' ? '🚨' : tipo === 'warning' ? '⚠️' : '📧';
      item.innerHTML = `
        <div class="alert-icon" aria-hidden="true">${icono}</div>
        <div class="alert-content">
          <div class="alert-title">${titulo}</div>
          <div class="alert-message">${mensaje}</div>
          <div class="alert-time">Justo ahora</div>
        </div>
      `;
      alertList.prepend(item);
    }

    // Click handler principal
    btnSimular.addEventListener('click', function () {
      try {
        const config = {
          tempMax: parseFloat(tempMax.value),
          humidityMin: parseFloat(humidityMin.value),
          phMin: parseFloat(phMin.value)
        };
        if (Number.isNaN(config.tempMax) || Number.isNaN(config.humidityMin) || Number.isNaN(config.phMin)) {
          console.error('Valores de configuración no válidos', config);
          alert('Uno o más valores de configuración no son válidos. Revisa los inputs.');
          return;
        }

        const actuales = obtenerValoresActuales();
        console.log('Simulación — actuales:', actuales, 'config:', config);

        let huboAlerta = false;
        if (actuales.temperatura > config.tempMax) {
          crearAlerta('warning', 'Temperatura Alta', `Temperatura actual: ${actuales.temperatura}°C (Límite: ${config.tempMax}°C)`);
          huboAlerta = true;
        }
        if (actuales.humedad < config.humidityMin) {
          crearAlerta('critical', 'Humedad Crítica', `Humedad actual: ${actuales.humedad}% (Límite: ${config.humidityMin}%)`);
          huboAlerta = true;
        }
        if (parseFloat(actuales.ph) < config.phMin) {
          crearAlerta('critical', 'pH Crítico', `pH actual: ${actuales.ph} (Mínimo: ${config.phMin})`);
          huboAlerta = true;
        }
        if (!huboAlerta) {
          crearAlerta('info', 'Todo en Orden ✅', `Temp: ${actuales.temperatura}°C · Humedad: ${actuales.humedad}% · pH: ${actuales.ph}`);
        }
      } catch (err) {
        console.error('Error en click handler:', err);
      }
    });

    // Helper de prueba desde la consola
    window._testAlerts = function () {
      console.log('Prueba rápida _testAlerts():', { tempMax: tempMax.value, humidityMin: humidityMin.value, phMin: phMin.value });
      btnSimular.click();
    };

  } catch (err) {
    console.error('Error inesperado en alerts.js:', err);
  }
});
