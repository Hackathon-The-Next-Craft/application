// Bloque de sistema inyectado idéntico en las 20 pantallas.
// Tokens y clases tomados de multix-design-system.md v1.0.
export const HELMET = `<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap">
  <style>
    :root{
      /* ---------- MARCA ---------- */
      --mx-iris-50:#F0EFFC;
      --mx-iris-100:#E7E5FB;
      --mx-iris-200:#CDC8F7;
      --mx-iris-300:#A9A1F0;
      --mx-iris-400:#7D72E8;
      --mx-iris-500:#4F42E3;
      --mx-iris-600:#3B2FD8;
      --mx-iris-700:#2E24AE;
      --mx-iris-800:#241C87;
      --mx-iris-900:#1A1463;
      --mx-iris-lift:#5A50EE;

      /* ---------- NEUTRALES ---------- */
      --mx-n-0:#FFFFFF;
      --mx-n-25:#F7F8FA;
      --mx-n-50:#EDEFF4;
      --mx-n-100:#E2E5EC;
      --mx-n-200:#D8DCE5;
      --mx-n-300:#C0C6D2;
      --mx-n-400:#9AA2B1;
      --mx-n-500:#5C6577;
      --mx-n-600:#454D5E;
      --mx-n-700:#252C3B;
      --mx-n-800:#191E29;
      --mx-n-900:#0F1219;

      /* ---------- ESTADOS ---------- */
      --mx-advance:#1D9A6C;   --mx-advance-bg:#E6F3EC;  --mx-advance-text:#14704F;  --mx-advance-dark:#4FD3A0;
      --mx-explore:#2E86C8;   --mx-explore-bg:#E6F0F9;  --mx-explore-text:#1F6296;  --mx-explore-dark:#6FB6EC;
      --mx-stuck:#C97A12;     --mx-stuck-bg:#FBF0DF;    --mx-stuck-text:#94590D;    --mx-stuck-dark:#F0AE55;
      --mx-fail:#D6423F;      --mx-fail-bg:#FBEBEA;     --mx-fail-text:#A32F2D;     --mx-fail-dark:#FF8A87;
      --mx-done:#14807E;      --mx-done-bg:#E3F1F1;     --mx-done-text:#0E5F5D;     --mx-done-dark:#43C4C1;

      /* extensión: borde de 1px para chips y bloques de estado */
      --mx-advance-bd:#BFE0CF;
      --mx-explore-bd:#BFD8EE;
      --mx-stuck-bd:#EDD5AE;
      --mx-fail-bd:#F2C7C5;
      --mx-done-bd:#BCDEDD;

      /* ---------- SEMÁNTICOS ---------- */
      --mx-bg:var(--mx-n-50);
      --mx-surface:var(--mx-n-0);
      --mx-surface-sunk:var(--mx-n-25);
      --mx-surface-dark:var(--mx-n-900);
      --mx-surface-dark-2:var(--mx-n-800);
      --mx-border:var(--mx-n-200);
      --mx-border-dark:var(--mx-n-700);
      --mx-text:var(--mx-n-900);
      --mx-text-muted:var(--mx-n-500);
      --mx-text-invert:var(--mx-n-0);
      --mx-text-dark:#E6E9EF;
      --mx-accent:var(--mx-iris-600);
      --mx-accent-hover:var(--mx-iris-700);
      --mx-accent-wash:var(--mx-iris-100);

      /* ---------- TIPOGRAFÍA ---------- */
      --mx-font-display:"Bricolage Grotesque",ui-sans-serif,system-ui,sans-serif;
      --mx-font-body:"Inter",ui-sans-serif,system-ui,-apple-system,sans-serif;
      --mx-font-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;

      /* ---------- SOMBRAS ---------- */
      --mx-shadow-sm:0 1px 2px rgba(15,18,25,.06);
      --mx-shadow-md:0 4px 12px -2px rgba(15,18,25,.10);
      --mx-shadow-lg:0 12px 32px -8px rgba(15,18,25,.18);
      --mx-shadow-panel:0 24px 60px -28px rgba(15,18,25,.55);
      --mx-focus-ring:0 0 0 2px #FFFFFF, 0 0 0 4px var(--mx-iris-600);

      /* ============================================================
         Alias de compatibilidad: los cuerpos de las pantallas se
         escribieron contra estos nombres; aquí resuelven al sistema.
         ============================================================ */
      --bg:var(--mx-bg);
      --bg-grad:var(--mx-bg);
      --surface:var(--mx-surface);
      --surface-2:var(--mx-surface-sunk);
      --grad-subtle:var(--mx-surface-sunk);
      --grad-topbar:var(--mx-surface);
      --veil:rgba(237,239,244,.74);
      --border:var(--mx-border);
      --border-2:var(--mx-n-300);
      --text:var(--mx-text);
      --text-2:var(--mx-text-muted);
      --text-3:var(--mx-text-muted);
      --accent:var(--mx-iris-600);
      --accent-2:var(--mx-iris-700);
      --accent-bg:var(--mx-iris-100);
      --accent-bd:var(--mx-iris-200);
      --grad-accent:var(--mx-iris-600);
      --ok:var(--mx-advance-text);       --ok-bg:var(--mx-advance-bg);  --ok-bd:var(--mx-advance-bd);  --grad-ok:var(--mx-advance);
      --explore:var(--mx-explore-text);  --explore-bg:var(--mx-explore-bg); --explore-bd:var(--mx-explore-bd); --grad-explore:var(--mx-explore);
      --stuck:var(--mx-stuck-text);      --stuck-bg:var(--mx-stuck-bg); --stuck-bd:var(--mx-stuck-bd); --grad-stuck:var(--mx-stuck);
      --fail:var(--mx-fail-text);        --fail-bg:var(--mx-fail-bg);   --fail-bd:var(--mx-fail-bd);
      --ink:var(--mx-n-900);
      --shadow-card:0 0 0 0 transparent;
      --shadow-accent:0 0 0 0 transparent;
      --shadow-lg:rgba(15,18,25,.18);
      --sans:var(--mx-font-body);
      --mono:var(--mx-font-mono);
      --display:var(--mx-font-display);
    }

    *{box-sizing:border-box;}
    body{
      margin:0;background:var(--mx-bg);color:var(--mx-text);
      font:400 16px/24px var(--mx-font-body);
      -webkit-font-smoothing:antialiased;
    }
    a{color:var(--mx-iris-600);text-decoration:none;}
    a:hover{color:var(--mx-iris-700);text-decoration:underline;}
    p{margin:0;}

    /* Display: Bricolage en todos los titulares */
    h1,h2,h3{margin:0;font-family:var(--mx-font-display);font-weight:700;letter-spacing:-.025em;}

    /* Utilidad: cifras verificables siempre tabulares */
    .num{font-variant-numeric:tabular-nums;}
    .code{font-family:var(--mx-font-mono);white-space:pre;margin:0;}

    /* Eyebrow / encabezado de columna */
    .mx-label{
      font-family:var(--mx-font-mono);font-size:11px;line-height:12px;font-weight:700;
      letter-spacing:.14em;text-transform:uppercase;color:var(--mx-text-muted);
    }
    /* Chip de estado */
    .mx-chip{
      display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;
      border-radius:999px;font-family:var(--mx-font-mono);font-size:10px;line-height:10px;
      font-weight:700;letter-spacing:.10em;text-transform:uppercase;white-space:nowrap;
    }
    .mx-chip--advance{background:var(--mx-advance-bg);color:var(--mx-advance-text);}
    .mx-chip--explore{background:var(--mx-explore-bg);color:var(--mx-explore-text);}
    .mx-chip--stuck{background:var(--mx-stuck-bg);color:var(--mx-stuck-text);}
    .mx-chip--fail{background:var(--mx-fail-bg);color:var(--mx-fail-text);}
    .mx-chip--done{background:var(--mx-done-bg);color:var(--mx-done-text);}
    .mx-chip--neutral{background:var(--mx-n-100);color:var(--mx-n-600);}
    .mx-chip--brand{background:var(--mx-iris-100);color:var(--mx-iris-700);}
    .mx-chip--dark{background:rgba(230,233,239,.10);color:var(--mx-text-dark);}

    /* Superficie de editor y panel: Tinta 900 */
    .mx-dark{background:var(--mx-n-900);color:var(--mx-text-dark);}
    .mx-dark .code{color:var(--mx-text-dark);}
    .mx-dark .k{color:var(--mx-iris-300);}
    .mx-dark .f{color:var(--mx-explore-dark);}
    .mx-dark .s{color:var(--mx-advance-dark);}
    .mx-dark .c{color:var(--mx-n-500);}
    .mx-dark .n{color:var(--mx-stuck-dark);}
    .mx-dark .gutter{color:var(--mx-n-600);}

    /* Sintaxis sobre superficie clara (evidencia, solución de referencia) */
    .k{color:var(--mx-iris-700);}
    .f{color:var(--mx-explore-text);}
    .s{color:var(--mx-advance-text);}
    .c{color:var(--mx-n-500);font-style:italic;}
    .n{color:var(--mx-stuck-text);}

    /* Bloque de evidencia */
    .mx-evidence{border-left:2px solid var(--mx-iris-600);padding-left:14px;font:400 12px/20px var(--mx-font-mono);white-space:pre-wrap;}

    @media (prefers-reduced-motion: reduce){
      *,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;}
    }
  </style>
</helmet>`;
