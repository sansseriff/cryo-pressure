<script lang="ts">
  import { onMount } from "svelte";
  import { calculateMaxAirInletPressure } from "./lib/calculator";
  import sadScientistImg from "./assets/sad_scientist.png";
  import ExplanationModal from "./lib/ExplanationModal.svelte";
  import "katex/dist/katex.min.css"; // Import KaTeX CSS

  let ambientTempF: number = 77;
  let ambientHumidity: number = 68;
  let coldestSurfaceK: number = 240; // Default to a reasonable value
  let maxAirInletPressureTorr: number | null = null;
  let showExplanationModal = false;

  function updateCalculation() {
    if (
      ambientTempF !== null &&
      !isNaN(ambientTempF) &&
      ambientHumidity !== null &&
      !isNaN(ambientHumidity) &&
      ambientHumidity >= 0 &&
      ambientHumidity <= 100 &&
      coldestSurfaceK !== null &&
      !isNaN(coldestSurfaceK) &&
      coldestSurfaceK >= 0
    ) {
      maxAirInletPressureTorr = calculateMaxAirInletPressure(
        coldestSurfaceK,
        ambientTempF,
        ambientHumidity
      );
    } else {
      maxAirInletPressureTorr = null;
    }
  }

  // Reactive updates whenever input values change
  $: ambientTempF, ambientHumidity, coldestSurfaceK, updateCalculation();

  // Initial calculation on component mount
  onMount(() => {
    updateCalculation();
  });
</script>

<main>
  <div class="container">
    <div class="image-section">
      <img src={sadScientistImg} alt="Sad Scientist with Cryostat" />
      <p class="caption">
        Sally is bummed that the cryostat's been warming all weekend, and now
        it's Monday and she still can't open it.
      </p>
    </div>
    <div class="calculator-section">
      <h1>Cryostat Safe Air Inlet Calculator</h1>
      <button
        class="explanation-button"
        on:click={() => (showExplanationModal = true)}
      >
        More Information
      </button>

      <div class="input-group">
        <label for="ambientTemp">Ambient Temperature (°F):</label>
        <input
          type="number"
          id="ambientTemp"
          bind:value={ambientTempF}
          placeholder="e.g., 77"
        />
      </div>

      <div class="input-group">
        <label for="ambientHumidity">Ambient Relative Humidity (%):</label>
        <input
          type="number"
          id="ambientHumidity"
          bind:value={ambientHumidity}
          min="0"
          max="100"
          placeholder="e.g., 68"
        />
      </div>

      <div class="input-group">
        <label for="coldestSurface">Coldest Cryostat Surface (K):</label>
        <input
          type="number"
          id="coldestSurface"
          bind:value={coldestSurfaceK}
          min="0"
          placeholder="e.g., 220"
        />
      </div>

      {#if maxAirInletPressureTorr !== null && !isNaN(maxAirInletPressureTorr)}
        <div class="result">
          <h2>Maximum safe air inlet pressure:</h2>
          <p class="pressure-value">
            {maxAirInletPressureTorr.toFixed(2)} Torr
          </p>
          {#if maxAirInletPressureTorr < 0}
            <p class="warning">
              Warning: Calculated pressure is negative. This implies
              condensation is highly likely even at vacuum, or inputs are in an
              extreme range. Check $T_{coldest}$ vs $T_{ambient}$.
            </p>
          {:else if maxAirInletPressureTorr < 10}
            <p class="note">
              This is a low pressure. Be cautious when introducing air.
            </p>
          {/if}
        </div>
      {:else if ambientTempF === null || ambientHumidity === null || coldestSurfaceK === null || isNaN(ambientTempF) || isNaN(ambientHumidity) || isNaN(coldestSurfaceK)}
        <div class="result">
          <p>Please enter valid numbers in all fields.</p>
        </div>
      {:else}
        <div class="result">
          <p>
            Calculation resulted in an invalid number (e.g., division by zero if
            ambient humidity implies zero water vapor pressure and coldest
            surface also implies zero saturation pressure). Please check inputs.
          </p>
        </div>
      {/if}
    </div>
  </div>

  <ExplanationModal
    bind:showModal={showExplanationModal}
    onClose={() => (showExplanationModal = false)}
  />
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    background-color: #ffdeaf;
    color: #333;
  }

  .container {
    display: flex;
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
    height: 100vh;
    padding: 20px;
    gap: 30px; /* Space between image and calculator sections */
    align-items: center; /* Vertically center content if it doesn't fill height */
    justify-content: center; /* Center content horizontally */
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
  }

  .image-section {
    flex: 1; /* Takes up half the space */
    max-width: 540px; /* Max width for the image section */
    text-align: center;
    padding: 20px;
  }

  .image-section img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .caption {
    margin-top: 15px;
    font-style: italic;
    color: #5a442c; /* Darker text for caption */
    font-size: 0.9em;
  }

  .calculator-section {
    flex: 1; /* Takes up half the space */
    max-width: 500px; /* Max width for the calculator */
    background-color: #fff7eb; /* Slightly lighter than page bg for contrast */
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  h1 {
    color: #8c5a2b; /* A warm, dark brown */
    text-align: center;
    margin-bottom: 10px; /* Adjusted margin */
  }

  .explanation-button {
    display: block;
    margin: 0 auto 25px auto; /* Center button and add margin below */
    padding: 8px 15px;
    font-size: 0.9em;
    color: #fff;
    background-color: #f38227; /* Orange color */
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .explanation-button:hover {
    background-color: #e39943; /* Darker orange on hover */
  }

  .input-group {
    margin-bottom: 20px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #6b4a2f;
  }

  .input-group input {
    width: calc(100% - 20px); /* Full width minus padding */
    padding: 10px;
    border: 1px solid #e0cbae;
    border-radius: 4px;
    font-size: 1em;
    background-color: #fff;
  }

  .input-group input:focus {
    outline: none;
    border-color: #f38227; /* Orange focus color */
    box-shadow: 0 0 0 2px rgba(243, 130, 39, 0.3);
  }

  .result {
    margin-top: 30px;
    padding: 15px;
    background-color: #ffeeda;
    border-left: 5px solid #f38227; /* Orange accent */
    border-radius: 4px;
  }

  .result h2 {
    margin-top: 0;
    color: #8c5a2b;
    font-size: 1.2em;
  }

  .result .pressure-value {
    font-size: 1.8em;
    font-weight: bold;
    color: #f38227; /* Prominent orange for the value */
    text-align: center;
  }

  .warning,
  .note {
    font-size: 0.9em;
    margin-top: 10px;
  }
  .warning {
    color: #d9534f; /* Red for warnings */
  }
  .note {
    color: #5bc0de; /* Blue for notes */
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      align-items: center;
    }
    .image-section,
    .calculator-section {
      max-width: 90%; /* Allow sections to take more width on small screens */
      flex-basis: auto; /* Reset flex-basis */
    }
  }
</style>
