import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";

/* ============================================================================
    1.  STYLES & ANIMATIONS
    ========================================================================== */
const GlobalStyles = () => (
  <style>{`
    @keyframes twinkle { 0%,100% {opacity:0;} 50% {opacity:1;} }
    @keyframes fade-in-down { from {opacity:0;transform:translateY(-20px);}
                              to   {opacity:1;transform:translateY(0);} }
    @keyframes fade-in-up   { from {opacity:0;transform:translateY(20px);}
                              to   {opacity:1;transform:translateY(0);} }
    @keyframes shake {0%,100%{transform:translateX(0);}
      10%,30%,50%,70%,90%{transform:translateX(-5px);}
      20%,40%,60%,80%{transform:translateX(5px);} }
    @keyframes spin {from{transform:rotate(0deg);}to{transform:rotate(360deg);} }

    /* Custom Scrollbar Styles */
    /* For Firefox */
    html {
      scrollbar-width: thin;
      scrollbar-color: #3b82f6 #1e293b; /* thumb-color track-color */
    }

    /* For Webkit-based browsers (Chrome, Safari, Edge) */
    ::-webkit-scrollbar {
      width: 12px;
    }
    ::-webkit-scrollbar-track {
      background-color: #1e293b; /* slate-800 */
    }
    ::-webkit-scrollbar-thumb {
      background-image: linear-gradient(to bottom, #06b6d4, #3b82f6); /* cyan-500 to blue-500 */
      border-radius: 20px;
      border: 3px solid #1e293b; /* Creates padding around the thumb */
    }
    ::-webkit-scrollbar-thumb:hover {
      background-image: linear-gradient(to bottom, #0891b2, #2563eb); /* cyan-600 to blue-600 */
    }
  `}</style>
);

/* ============================================================================
    2.  SVG ICONS
    ========================================================================== */
const Icon = ({ children, className = "", style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    {children}
  </svg>
);

// **REFACTOR:** Stylable icons now accept a `className` prop for easier Tailwind styling.
const SunIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" />
    <path d="m17.66 6.34 1.41-1.41" />
  </Icon>
);
const CpuIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </Icon>
);
const LayersIcon = ({ className }) => (
  <Icon className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Icon>
);
const ThermometerIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </Icon>
);
const TargetIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </Icon>
);

// Unstyled & animated icons
const RefreshCwIcon = () => (
  <Icon>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Icon>
);
const LoaderIcon = () => (
  <Icon className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Icon>
);
const AlertTriangleIcon = () => (
  <Icon>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </Icon>
);

/* ============================================================================
    3.  Count‑Up Hook
    ========================================================================== */
const useCountUp = (endValue, duration = 2000) => {
  const [currentValue, setCurrentValue] = useState(0);
  const frameRef = useRef();
  const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
  useEffect(() => {
    let startTime = null;
    const a = (t) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / duration, 1);
      setCurrentValue(endValue * ease(p));
      if (p < 1) frameRef.current = requestAnimationFrame(a);
    };
    frameRef.current = requestAnimationFrame(a);
    return () => cancelAnimationFrame(frameRef.current);
  }, [endValue, duration]);
  return currentValue;
};
const AnimatedNumber = ({ value, formatter }) => (
  <>{formatter(useCountUp(value))}</>
);

/* ============================================================================
    4.  PHYSICS & CALCULATION LOGIC
    ========================================================================== */
const SIGMA = 5.670374419e-8,
  K_B = 1.380649e-23,
  LN2 = 0.69314718056,
  AU = 1.495978707e11,
  L_SUN = 3.828e26;
const calculateBrainProps = (params) => {
  const {
    luminosityMethod,
    starMass,
    starRadius,
    starTeff,
    starLuminosity,
    alpha,
    epsilon,
    T_inner,
    f_T,
    f_r,
    terminationCriterion,
    T_outer,
    N_max,
    showCarnot,
    showLandauer,
    showExergy,
  } = params;
  const warnings = [];
  if (
    f_T >= 1 ||
    f_r <= 1 ||
    alpha <= 0 ||
    alpha > 1 ||
    epsilon <= 0 ||
    epsilon > 1
  )
    throw new Error("Invalid physics parameters.");
  let L_star;
  if (luminosityMethod === "direct") L_star = starLuminosity;
  else if (luminosityMethod === "radius_temp")
    L_star =
      4 * Math.PI * Math.pow(starRadius, 2) * SIGMA * Math.pow(starTeff, 4);
  else {
    L_star = L_SUN * Math.pow(starMass, 2.3);
    if (starMass > 0.5)
      warnings.push(
        "Scientific Accuracy: The mass-luminosity law M^2.3 is only accurate for red dwarfs (< 0.5 M☉). The result may be inaccurate."
      );
  }
  if (!L_star || L_star <= 0)
    throw new Error("Could not calculate a positive stellar luminosity.");
  const r0 = Math.sqrt(
    (alpha * L_star) / (4 * Math.PI * epsilon * SIGMA * Math.pow(T_inner, 4))
  );
  let numLayers;
  if (terminationCriterion === "temp") {
    if (!T_outer || T_outer <= 0 || T_outer >= T_inner)
      throw new Error("Invalid outer temperature.");
    numLayers = Math.ceil(Math.log(T_outer / T_inner) / Math.log(f_T));
  } else {
    if (!N_max || N_max <= 0) throw new Error("Invalid number of layers.");
    numLayers = N_max - 1;
  }
  const shells = [];
  let T = T_inner,
    r = r0;
  for (let n = 0; n <= numLayers; n++) {
    const row = {
      layer: n,
      equilibriumTemp: T,
      radiusMeters: r,
      radiusAu: r / AU,
    };
    if (showCarnot && n < numLayers) row.carnot = 1 - f_T;
    if (showLandauer) row.landauer = K_B * T * LN2;
    if (showExergy && n < numLayers) row.exergy = (1 - f_T) * L_star;
    shells.push(row);
    if (terminationCriterion === "temp" && T <= T_outer) break;
    T *= f_T;
    r *= f_r;
  }
  const finalTemp =
    shells.length > 0 ? shells[shells.length - 1].equilibriumTemp : 0;
  const landauerLimitEnergy = K_B * finalTemp * LN2;
  const totalThroughput = finalTemp > 0 ? L_star / landauerLimitEnergy : 0;
  return {
    shellDetails: shells,
    totalLayers: shells.length,
    calculatedLuminosity: L_star,
    innerShellRadiusAu: shells[0]?.radiusAu ?? 0,
    warnings: warnings,
    totalThroughput: totalThroughput,
  };
};

/* ============================================================================
    5.  HELPER UI COMPONENTS
    ========================================================================== */
const FormFieldset = ({ legend, children }) => (
  <fieldset className="p-5 mb-6 border rounded-lg border-sky-400/20">
    <legend className="px-2 font-medium text-cyan-200">{legend}</legend>
    {children}
  </fieldset>
);
const Stars = React.memo(() => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    {useMemo(
      () =>
        Array.from({ length: 50 }).map(() => ({
          "--star-x": `${Math.random() * 100}%`,
          "--star-y": `${Math.random() * 100}%`,
          width: `${1 + Math.random() * 2}px`,
          height: `${1 + Math.random() * 2}px`,
          "--animation-delay": `${Math.random() * 10}s`,
          "--animation-duration": `${5 + Math.random() * 10}s`,
        })),
      []
    ).map((s, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full"
        style={{
          left: s["--star-x"],
          top: s["--star-y"],
          animation: `twinkle ${s["--animation-duration"]} ${s["--animation-delay"]} infinite`,
          ...s,
        }}
      />
    ))}
  </div>
));
const InfoTooltip = React.memo(({ text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline-flex ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400 cursor-help"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      {visible && (
        <span className="absolute top-[125%] left-1/2 z-50 w-[220px] -translate-x-1/2 rounded-md bg-gray-800 py-2 px-3 text-center text-sm text-white shadow-md pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
});
const InputField = React.memo(
  ({ id, label, unit, tooltip, disabled, ...props }) => (
    <div className="w-full">
      <label
        htmlFor={id}
        className={`flex items-center text-sm mb-2 ${
          disabled ? "text-gray-500" : "text-cyan-200/80"
        }`}
      >
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </label>
      <div className="relative">
        <input
          id={id}
          {...props}
          disabled={disabled}
          className={`w-full rounded-lg border border-sky-400/30 py-2 pl-4 backdrop-blur-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
            unit ? "pr-14" : "pr-4"
          } ${
            disabled
              ? "cursor-not-allowed bg-slate-800/80 text-gray-400"
              : "bg-slate-800/50 text-white"
          }`}
        />
        {unit && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
);
const StatCard = React.memo(
  ({ icon, label, value, unit, color, formatter }) => (
    <div className="flex flex-col justify-between p-4 bg-black/20 rounded-lg border border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm text-gray-400">{label}</p>
      </div>
      <p
        className="mt-auto text-2xl font-semibold text-white whitespace-nowrap"
        style={{ color }}
      >
        <AnimatedNumber value={value} formatter={formatter} />{" "}
        <span className="ml-1 text-lg">{unit}</span>
      </p>
    </div>
  )
);
const CheckboxField = React.memo(({ id, label, tooltip, ...props }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id={id}
      {...props}
      className="w-4 h-4 rounded accent-blue-500 focus:ring-blue-500"
    />
    <label
      htmlFor={id}
      className="flex items-center text-sm text-white cursor-pointer"
    >
      {label}
      {tooltip && <InfoTooltip text={tooltip} />}
    </label>
  </div>
));

const ResultsDisplay = React.memo(({ results, params }) => (
  <div
    className="w-full max-w-6xl mt-10"
    style={{ animation: "fade-in-up 0.7s ease-out 0.2s forwards", opacity: 0 }}
  >
    <div
      className="p-8 bg-gray-900/50 rounded-2xl border border-sky-400/30 backdrop-blur-sm shadow-2xl"
      style={{ boxShadow: "0 25px 50px -12px rgba(56,189,248,0.1)" }}
    >
      <h2 className="mb-6 text-3xl font-bold text-center text-transparent bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text">
        Computational Architecture
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        <StatCard
          icon={<LayersIcon className="text-purple-400" />}
          label="Total Calculated Layers"
          value={results.totalLayers}
          unit=""
          color="#c084fc"
          formatter={(n) => n.toFixed(0)}
        />
        <StatCard
          icon={<SunIcon className="text-yellow-300" />}
          label="Stellar Luminosity"
          value={results.calculatedLuminosity}
          unit="Watts"
          color="#fde047"
          formatter={(n) => n.toExponential(2)}
        />
        <StatCard
          icon={<TargetIcon className="text-red-400" />}
          label="Inner Shell Radius"
          value={results.innerShellRadiusAu}
          unit="AU"
          color="#f87171"
          formatter={(n) => n.toFixed(3)}
        />
        <StatCard
          icon={<CpuIcon className="text-cyan-300" />}
          label="Total Throughput"
          value={results.totalThroughput}
          unit="bits/s"
          color="#67e8f9"
          formatter={(n) => n.toExponential(2)}
        />
      </div>
      {results.warnings?.length > 0 && (
        <div className="flex gap-3 p-4 mb-8 text-yellow-300 border rounded-lg bg-yellow-300/10 border-yellow-400">
          <AlertTriangleIcon />
          <div>
            <h3 className="mb-1 font-bold">Scientific Accuracy Notes</h3>
            {results.warnings.map((w, i) => (
              <p key={i} className="text-sm">
                {w}
              </p>
            ))}
          </div>
        </div>
      )}
      <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold">
        Shell Breakdown
      </h3>
      <div className="pr-2 overflow-y-auto max-h-80">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-900">
            <tr>
              <th className="p-2 text-left">Shell</th>
              <th className="p-2 text-left">Radius (AU)</th>
              <th className="flex items-center p-2 text-left">
                Temp (K)
                <InfoTooltip text="~0.00 signifies a temperature approaching, but not reaching, absolute zero, which is physically impossible." />
              </th>
              {params.showCarnot && <th className="p-2 text-left">Carnot η</th>}
              {params.showLandauer && (
                <th className="p-2 text-left">Landauer (J)</th>
              )}
              {params.showExergy && (
                <th className="p-2 text-left">Exergy (W)</th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.shellDetails.map((s) => (
              <tr key={s.layer} className="border-t border-gray-800">
                <td className="py-3 px-2 font-bold text-purple-400">
                  #{s.layer + 1}
                </td>
                <td className="py-3 px-2">
                  {s.radiusAu < 1000
                    ? s.radiusAu.toFixed(2)
                    : s.radiusAu.toExponential(2)}
                </td>
                <td className="py-3 px-2">
                  {s.equilibriumTemp.toFixed(2) === "0.00"
                    ? "~0.00"
                    : s.equilibriumTemp.toFixed(2)}
                </td>
                {params.showCarnot && (
                  <td className="py-3 px-2">
                    {s.carnot ? s.carnot.toFixed(2) : "–"}
                  </td>
                )}
                {params.showLandauer && (
                  <td className="py-3 px-2">
                    {s.landauer ? s.landauer.toExponential(2) : "–"}
                  </td>
                )}
                {params.showExergy && (
                  <td className="py-3 px-2">
                    {s.exergy ? s.exergy.toExponential(2) : "–"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
));

/* ============================================================================
    6.  MAIN PAGE COMPONENT
    ========================================================================== */
const initialParams = {
  luminosityMethod: "mass",
  starMass: "1",
  starRadius: "6.957e8",
  starTeff: "5778",
  starLuminosity: "3.828e26",
  alpha: "0.99",
  epsilon: "0.99",
  sameAlphaEpsilon: true,
  T_inner: "1000",
  architectureDriver: "radius",
  f_T: "0.50",
  f_r: "4.00",
  terminationCriterion: "temp",
  T_outer: "3",
  N_max: "20",
  showCarnot: false,
  showLandauer: true,
  showExergy: false,
};
const numericFields = new Set([
  "starMass",
  "starRadius",
  "starTeff",
  "starLuminosity",
  "alpha",
  "epsilon",
  "T_inner",
  "f_T",
  "f_r",
  "T_outer",
  "N_max",
]);

export default function HomePage() {
  const [params, setParams] = useState(initialParams);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (numericFields.has(name)) {
      val = val.replace(/[^0-9.e-]/g, "");
    }

    setParams((p) => {
      let newParams = { ...p, [name]: val };
      const updateLinkedFactors = (driver) => {
        const alpha = parseFloat(newParams.alpha);
        if (!isFinite(alpha) || alpha <= 0) return;
        if (driver === "temp") {
          const f_T = parseFloat(newParams.f_T);
          if (isFinite(f_T) && f_T > 0 && f_T < 1) {
            const new_f_r = Math.sqrt(alpha) / (f_T * f_T);
            newParams.f_r = new_f_r.toFixed(4);
          }
        } else {
          const f_r = parseFloat(newParams.f_r);
          if (isFinite(f_r) && f_r > 1) {
            const new_f_T = Math.pow(alpha, 0.25) / Math.sqrt(f_r);
            newParams.f_T = new_f_T.toFixed(4);
          }
        }
      };
      if (name === "f_T") updateLinkedFactors("temp");
      if (name === "f_r") updateLinkedFactors("radius");
      if (name === "alpha") updateLinkedFactors(newParams.architectureDriver);
      if (name === "architectureDriver") updateLinkedFactors(val);
      if (name === "alpha" && newParams.sameAlphaEpsilon) {
        newParams.epsilon = val;
      }
      if (name === "sameAlphaEpsilon") {
        newParams.epsilon = checked ? newParams.alpha : p.epsilon;
      }
      return newParams;
    });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");
      setResults(null);
      const parsedParams = Object.fromEntries(
        Object.entries(params).map(([k, v]) =>
          numericFields.has(k) ? [k, parseFloat(v)] : [k, v]
        )
      );
      setTimeout(() => {
        try {
          const res = calculateBrainProps(parsedParams);
          setResults({ ...res, paramsUsed: params });
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }, 800);
    },
    [params]
  );

  const handleReset = useCallback(() => {
    setParams(initialParams);
    setResults(null);
    setError("");
    setIsLoading(false);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans text-white bg-slate-900">
      <GlobalStyles />
      <Stars />
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-8">
        <header
          className="mb-8 text-center"
          style={{ animation: "fade-in-down 0.7s ease-out forwards" }}
        >
          <h1
            className="mb-2 text-5xl font-bold text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-indigo-400 bg-clip-text"
            style={{ textShadow: "0 0 15px rgba(100,200,255,0.5)" }}
          >
            Matrioshka Brain Builder
          </h1>
          <p className="mx-auto max-w-[42rem] text-gray-300/80">
            Design a Matrioshka Brain megastructure based on stellar physics and
            thermodynamic principles.
          </p>
        </header>

        <main className="flex flex-col items-center w-full max-w-6xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full p-8 border rounded-xl bg-slate-800/40 border-sky-400/20 backdrop-blur-md shadow-2xl"
            style={{
              animation: "fade-in-up 0.7s ease-out 0.2s forwards",
              opacity: 0,
            }}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* LEFT COLUMN */}
              <div>
                <FormFieldset legend="A. Stellar Data">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="luminosityMethod"
                        value="mass"
                        checked={params.luminosityMethod === "mass"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Mass
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="luminosityMethod"
                        value="radius_temp"
                        checked={params.luminosityMethod === "radius_temp"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By R & T
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="luminosityMethod"
                        value="direct"
                        checked={params.luminosityMethod === "direct"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Luminosity
                    </label>
                  </div>
                  {params.luminosityMethod === "mass" && (
                    <InputField
                      key="starMass"
                      id="starMass"
                      name="starMass"
                      label="Mass"
                      type="text"
                      value={params.starMass}
                      onChange={handleInputChange}
                      unit="M☉"
                      tooltip="Mass of the star in solar masses. Used for a rough luminosity estimate for red dwarfs."
                    />
                  )}
                  {params.luminosityMethod === "radius_temp" && (
                    <div className="flex flex-col gap-4">
                      <InputField
                        key="starRadius"
                        id="starRadius"
                        name="starRadius"
                        label="Radius"
                        type="text"
                        value={params.starRadius}
                        onChange={handleInputChange}
                        unit="m"
                        tooltip="The star's radius in meters. Used for precise luminosity calculation."
                      />
                      <InputField
                        key="starTeff"
                        id="starTeff"
                        name="starTeff"
                        label="Surface Temp"
                        type="text"
                        value={params.starTeff}
                        onChange={handleInputChange}
                        unit="K"
                        tooltip="The star's effective surface temperature in Kelvin."
                      />
                    </div>
                  )}
                  {params.luminosityMethod === "direct" && (
                    <InputField
                      key="starLuminosity"
                      id="starLuminosity"
                      name="starLuminosity"
                      label="Luminosity"
                      type="text"
                      value={params.starLuminosity}
                      onChange={handleInputChange}
                      unit="Watts"
                      tooltip="The star's total energy output in Watts. The most direct input."
                    />
                  )}
                </FormFieldset>
                <FormFieldset legend="B. Shell Radiative Properties">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <InputField
                      key="alpha"
                      id="alpha"
                      name="alpha"
                      label="Absorptivity (α)"
                      type="text"
                      value={params.alpha}
                      onChange={handleInputChange}
                      tooltip="Fraction (0-1) of incoming energy a shell absorbs. Higher values capture more energy."
                    />
                    <InputField
                      key="epsilon"
                      id="epsilon"
                      name="epsilon"
                      label="Emissivity (ε)"
                      type="text"
                      value={params.epsilon}
                      onChange={handleInputChange}
                      disabled={params.sameAlphaEpsilon}
                      tooltip="Fraction (0-1) of energy a shell radiates away as heat. Higher values cool more effectively."
                    />
                  </div>
                  <div className="mt-4">
                    <CheckboxField
                      id="sameAlphaEpsilon"
                      name="sameAlphaEpsilon"
                      label="Same for both (α = ε)"
                      checked={params.sameAlphaEpsilon}
                      onChange={handleInputChange}
                    />
                  </div>
                </FormFieldset>
              </div>
              {/* RIGHT COLUMN */}
              <div>
                <FormFieldset legend="C. Architecture Knobs">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="architectureDriver"
                        value="radius"
                        checked={params.architectureDriver === "radius"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      Control Radius Factor
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="architectureDriver"
                        value="temp"
                        checked={params.architectureDriver === "temp"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      Control Temp Factor
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <InputField
                      key="T_inner"
                      id="T_inner"
                      name="T_inner"
                      label="Inner Temp"
                      type="text"
                      value={params.T_inner}
                      onChange={handleInputChange}
                      unit="K"
                      tooltip="Operating temperature of the innermost shell. Limited by material science (e.g., 1000K)."
                    />
                    <InputField
                      key="f_r"
                      id="f_r"
                      name="f_r"
                      label="Radius Factor (fr)"
                      type="text"
                      value={params.f_r}
                      onChange={handleInputChange}
                      disabled={params.architectureDriver !== "radius"}
                      tooltip="The radius ratio between shells. Physically linked to Temp Factor."
                    />
                    <InputField
                      key="f_T"
                      id="f_T"
                      name="f_T"
                      label="Temp Factor (fT)"
                      type="text"
                      value={params.f_T}
                      onChange={handleInputChange}
                      disabled={params.architectureDriver !== "temp"}
                      tooltip="The temperature ratio between shells. Physically linked to Radius Factor."
                    />
                  </div>
                </FormFieldset>
                <FormFieldset legend="D. Termination Criterion">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="terminationCriterion"
                        value="temp"
                        checked={params.terminationCriterion === "temp"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Outer Temp
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="terminationCriterion"
                        value="layers"
                        checked={params.terminationCriterion === "layers"}
                        onChange={handleInputChange}
                        className="mr-2 accent-blue-500"
                      />
                      By Layer Count
                    </label>
                  </div>
                  {params.terminationCriterion === "temp" ? (
                    <InputField
                      key="T_outer"
                      id="T_outer"
                      name="T_outer"
                      label="Target Outer Temperature"
                      type="text"
                      value={params.T_outer}
                      onChange={handleInputChange}
                      unit="K"
                      tooltip="Build layers until the outermost shell is at or below this temperature (e.g., 3K CMB)."
                    />
                  ) : (
                    <InputField
                      key="N_max"
                      id="N_max"
                      name="N_max"
                      label="Number of Layers"
                      type="text"
                      value={params.N_max}
                      onChange={handleInputChange}
                      tooltip="Build a specific number of layers, starting from the inside."
                    />
                  )}
                </FormFieldset>
              </div>
            </div>
            <FormFieldset legend="E. Optional Columns">
              <div className="flex flex-wrap justify-center gap-6">
                <CheckboxField
                  id="showCarnot"
                  name="showCarnot"
                  label="Carnot η"
                  checked={params.showCarnot}
                  onChange={handleInputChange}
                  tooltip="Ideal thermodynamic efficiency of converting heat into work between two shells."
                />
                <CheckboxField
                  id="showLandauer"
                  name="showLandauer"
                  label="Landauer Limit"
                  checked={params.showLandauer}
                  onChange={handleInputChange}
                  tooltip="The minimum energy required to erase one bit of information at the shell's temperature."
                />
                <CheckboxField
                  id="showExergy"
                  name="showExergy"
                  label="Layer Exergy"
                  checked={params.showExergy}
                  onChange={handleInputChange}
                  tooltip="A simplified model of the maximum power available for computation in each layer."
                />
              </div>
            </FormFieldset>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset form"
                className="p-3 font-bold text-white rounded-lg cursor-pointer bg-slate-600/50 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <RefreshCwIcon />
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center w-48 gap-2 py-3 font-bold text-white rounded-lg cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isLoading ? (
                  <>
                    <LoaderIcon />
                    Building...
                  </>
                ) : (
                  "Build Brain"
                )}
              </button>
            </div>
            {error && (
              <p
                className="mt-4 text-center text-red-400"
                style={{ animation: "shake 0.5s ease-in-out" }}
              >
                {error}
              </p>
            )}
          </form>
          {results && (
            <ResultsDisplay results={results} params={results.paramsUsed} />
          )}
        </main>
      </div>
    </div>
  );
}
