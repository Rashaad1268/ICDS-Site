<script>
  let showForm = false;
  export let selectedSeat;

  let form = {
    name: "",
    contact: "",
    email: "",
    affiliation: "",
    club: "",
    food: ""
  };

  async function submitForm() {
    try {
      if (!selectedSeat) {
        alert("Please select a seat first.");
        return;
      }

      const payload = {
        ...form,
        seatId: selectedSeat
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Registration successful for ${form.name}`);

        // Reset form
        form = {
          name: "",
          contact: "",
          email: "",
          affiliation: "",
          club: "",
          food: ""
        };
        showForm = false;
        document.location.reload();
      } else {
        const error = await res.text();
        alert("❌ Failed to register: " + error);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Something went wrong while submitting the form.");
    }
  }
</script>

<div class="text-center">
  <button
    on:click={() => showForm = true}
    disabled={!selectedSeat}
    class="px-4 sm:px-6 py-2 sm:py-3 bg-amber-400 text-black font-semibold text-sm sm:text-base rounded-lg shadow-lg hover:bg-amber-500 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Register Seat
  </button>
</div>

{#if showForm}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-3 sm:p-4 overflow-y-auto">
    <div class="bg-neutral-950 border border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg shadow-2xl relative my-auto">
      <!-- Close button -->
      <button
        class="absolute top-2 right-3 sm:top-3 sm:right-4 text-gray-500 hover:text-amber-400 text-2xl sm:text-3xl z-10"
        on:click={() => showForm = false}
        aria-label="Close"
      >
        &times;
      </button>

      <!-- Title -->
      <h2 class="text-xl sm:text-2xl font-bold text-amber-400 text-center mb-1 sm:mb-2 pr-8">
        Register for Seat {selectedSeat}
      </h2>
      <p class="text-gray-400 text-center mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm">
        Please fill in your details to complete the registration.
      </p>

      <!-- Form -->
      <form on:submit|preventDefault={submitForm} class="space-y-3 sm:space-y-4 md:space-y-5">
        <!-- Name -->
        <div>
          <label class="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">Full Name</label>
          <input
            type="text"
            bind:value={form.name}
            required
            placeholder="Enter your full name"
            class="w-full p-2 sm:p-2.5 placeholder:text-gray-400 bg-gray-900 border border-gray-700 rounded-lg text-sm sm:text-base text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all duration-200"
          />
        </div>

        <!-- Contact -->
        <div>
          <label class="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">Contact Number</label>
          <input
            type="tel"
            bind:value={form.contact}
            required
            pattern="[0-9+ ]+"
            placeholder="071 234 5678"
            class="w-full p-2 sm:p-2.5 placeholder:text-gray-400 bg-gray-900 border border-gray-700 rounded-lg text-sm sm:text-base text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all duration-200"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">Email</label>
          <input
            type="email"
            bind:value={form.email}
            required
            class="w-full p-2 sm:p-2.5 placeholder:text-gray-400 bg-gray-900 border border-gray-700 rounded-lg text-sm sm:text-base text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all duration-200"
          />
        </div>

        <!-- Affiliation -->
        <div>
          <label class="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">Affiliation</label>
          <select
            bind:value={form.affiliation}
            required
            class="w-full p-2 sm:p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm sm:text-base text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all duration-200"
          >
            <option value="" disabled selected>Select your affiliation</option>
            <option>Interact</option>
            <option>Rotaract</option>
            <option>Rotary</option>
            <option>Interact district council</option>
            <option>Past interact district council</option>
            <option>Parents</option>
            <option>Personal invites</option>
            <option>Other</option>
          </select>
        </div>

        <!-- Club (optional) -->
        <div>
          <label class="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">
            Name of Relevant Club <span class="text-gray-500 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            bind:value={form.club}
            class="w-full p-2 sm:p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm sm:text-base text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all duration-200"
          />
        </div>

        <!-- Food Preference -->
        <div>
          <label class="block text-gray-300 mb-1 text-xs sm:text-sm font-medium">Food Preference</label>
          <select
            bind:value={form.food}
            required
            class="w-full p-2 sm:p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-sm sm:text-base text-gray-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all duration-200"
          >
            <option value="" disabled selected>Select preference</option>
            <option>Vegetarian</option>
            <option>Non-Vegetarian</option>
          </select>
        </div>

        <!-- Submit -->
        <div class="pt-2 sm:pt-4 text-center">
          <button
            type="submit"
            class="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 sm:py-2.5 text-sm sm:text-base rounded-lg transition-all duration-200 active:scale-95 shadow-lg"
          >
            Submit Registration
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}