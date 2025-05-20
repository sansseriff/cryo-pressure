<script lang="ts">
  import { onMount } from "svelte";
  import katex from "katex";

  export let showModal: boolean;
  export let onClose: () => void;

  const explanationHTML = `
    <p>This calculator determines the maximum amount of ambient air that can be introduced into a cryostat for warming, without causing water to condense or freeze on cold internal surfaces.</p>
    <h3>Goal: Controlled Cryostat Warming</h3>
    <p>When using ambient air to warm a cryostat, its moisture content is a critical concern. If the partial pressure of water vapor from the introduced air (${katex.renderToString("P_{\\text{water,in}}")}) exceeds the saturation vapor pressure at the temperature of the cryostat's coldest internal surface (${katex.renderToString("T_{\\text{coldest}}")}), water will condense. If ${katex.renderToString("T_{\\text{coldest}}")} is below the freezing point of water, this condensate will turn to ice.</p>
    <p>The objective is to ensure:
    ${katex.renderToString("P_{\\text{water,in}} < P_{\\text{sat}}(T_{\\text{coldest}})")}
    </p>
    <h3>Step-by-Step Calculation</h3>
    <ol>
      <li>
        <strong>Actual Water Vapor Pressure of Ambient Air:</strong>
        <p>The process begins by determining the actual partial pressure of water vapor in the ambient air (${katex.renderToString("P_{\\text{actual,ambient}}")}). This is calculated from the ambient temperature (${katex.renderToString("T_{\\text{ambient}}")}) and relative humidity (${katex.renderToString("RH_{\\text{ambient}}")}). The <a href="https://en.wikipedia.org/wiki/Arden_Buck_equation" target="_blank" rel="noopener noreferrer">Arden Buck equation</a> is used to find the saturation vapor pressure at ${katex.renderToString("T_{\\text{ambient}}")}, which is then scaled by ${katex.renderToString("RH_{\\text{ambient}}")}:
        ${katex.renderToString("P_{\\text{actual,ambient}} = P_{\\text{sat}}(T_{\\text{ambient}}) \\times \\frac{RH_{\\text{ambient}}}{100}")}
        </p>
      </li>
      <li>
        <strong>Saturation Water Vapor Pressure at the Coldest Surface:</strong>
        <p>Next, we determine the saturation water vapor pressure at the coldest surface inside the cryostat (${katex.renderToString("P_{\\text{sat,coldest}}")}). This is the maximum partial pressure of water that can exist at this temperature (${katex.renderToString("T_{\\text{coldest}}")}) before condensation occurs. The Arden Buck equation is used again:
        ${katex.renderToString("P_{\\text{sat,coldest}} = P_{\\text{sat}}(T_{\\text{coldest}})")}
        </p>
      </li>
      <li>
        <strong>Determining Maximum Air Inlet Pressure:</strong>
        <p>When ambient air is introduced into the cryostat up to a total pressure ${katex.renderToString("P_{\\text{air,let}\\_in}")}, the partial pressure of water vapor inside (${katex.renderToString("P_{\\text{water,in}}")}) due to this introduced air is proportional to the mole fraction of water vapor in the ambient air. Assuming the ambient air is at a standard atmospheric pressure (${katex.renderToString("P_{\\text{atmospheric}}")}), this relationship is:
        ${katex.renderToString("P_{\\text{water,in}} = \\frac{P_{\\text{air,let}\\_in}}{P_{\\text{atmospheric}}} \\times P_{\\text{actual,ambient}}")}
        </p>
        <p>To prevent condensation, the condition ${katex.renderToString("P_{\\text{water,in}} \\le P_{\\text{sat,coldest}}")} must be met. The maximum pressure of air that can be safely let in (${katex.renderToString("P_{\\text{max,air}\\_in}")}) is found when ${katex.renderToString("P_{\\text{water,in}}")} is equal to ${katex.renderToString("P_{\\text{sat,coldest}}")}:
        ${katex.renderToString("P_{\\text{sat,coldest}} = \\frac{P_{\\text{max,air}\\_in}}{P_{\\text{atmospheric}}} \\times P_{\\text{actual,ambient}}")}
        </p>
        <p>Solving for ${katex.renderToString("P_{\\text{max,air}\\_in}")} gives:
        ${katex.renderToString("P_{\\text{max,air}\\_in} = P_{\\text{atmospheric}} \\times \\frac{P_{\\text{sat,coldest}}}{P_{\\text{actual,ambient}}}")}
        </p>
      </li>
    </ol>
    <p>The <code><a href="https://github.com/sansseriff/cryo-pressure/blob/master/src/lib/calculator.ts" target="_blank" rel="noopener noreferrer">calculateMaxAirInletPressure</a></code> function in the script implements this final calculation, using ${katex.renderToString("T_{\\text{coldest}}")}, ${katex.renderToString("T_{\\text{ambient}}")}, and ${katex.renderToString("RH_{\\text{ambient}}")} as inputs to return the maximum safe pressure of air to introduce into the cryostat.</p>
  `;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if showModal}
  <div class="modal-backdrop" on:click={onClose} role="presentation">
    <div
      class="modal-content"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button class="close-button" on:click={onClose} aria-label="Close modal"
        >&times;</button
      >
      <h2 id="modal-title">Calculator Explanation</h2>
      <div class="explanation-body">
        {@html explanationHTML}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #fff7eb;
    padding: 25px 35px;
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    width: 80%;
    max-width: 700px;
    max-height: 85vh;
    overflow-y: auto;
    position: relative;
    color: #333;
  }

  .close-button {
    position: absolute;
    top: 15px;
    right: 20px;
    background: none;
    border: none;
    font-size: 2em;
    cursor: pointer;
    color: #8c5a2b;
    line-height: 1;
  }
  .close-button:hover {
    color: #f38227;
  }

  .modal-content h2 {
    color: #8c5a2b;
    margin-top: 0;
    margin-bottom: 20px;
    text-align: center;
  }

  .explanation-body {
    font-size: 0.95em;
    line-height: 1.7;
    text-align: left; /* Ensure paragraph text is left-aligned */
  }

  .explanation-body h3 {
    color: #6b4a2f;
    margin-top: 20px;
    margin-bottom: 10px;
    border-bottom: 1px solid #e0cbae;
    padding-bottom: 5px;
  }

  .explanation-body ol {
    padding-left: 20px;
  }
  .explanation-body li {
    margin-bottom: 15px;
  }
  .explanation-body strong {
    color: #5a442c;
  }
  .explanation-body code {
    background-color: #ffeeda;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: "Courier New", Courier, monospace;
  }
  .explanation-body code a {
    color: inherit; /* Make the link inside code tag inherit code's color */
    text-decoration: underline; /* But still show it's a link */
  }
  .explanation-body code a:hover {
    color: #f38227; /* Change color on hover for visibility */
  }

  .explanation-body a {
    color: #f38227; /* Orange link color */
    text-decoration: none;
  }
  .explanation-body a:hover {
    text-decoration: underline;
  }

  /* KaTeX styling - ensure katex.min.css is also linked in App.svelte or global styles */
  :global(.katex) {
    font-size: 1.1em; /* Adjust as needed */
  }
  :global(.katex-display) {
    margin: 0.5em 0;
    display: block;
    text-align: center; /* This centers the math block itself */
  }
</style>
