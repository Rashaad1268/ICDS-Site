<script>
    import { onMount } from 'svelte';
    import RegistrationForm from "./registrationForm.svelte";
    let currentFloor = 1;
    let seats = {};
    let reservedSeatIds = [];
    let isLoading = true;
    let errorMessage = '';
    // Define the seating layout
    const layout = {
        floor1: {
            left: {
                top: [
                    { cols: 3, rows: 1, startRow: 0 },
                    { cols: 7, rows: 2, startRow: 1 },
                    { cols: 6, rows: 1, startRow: 3 },
                    { cols: 5, rows: 2, startRow: 4 },
                    { cols: 4, rows: 1, startRow: 6 },
                    { cols: 3, rows: 1, startRow: 7 },
                    { cols: 4, rows: 1, startRow: 8 },
                ],
                bottom: [
                    { cols: 8, rows: 3, startRow: 0 },
                    { cols: 6, rows: 2, startRow: 3 },
                    { cols: 7, rows: 5, startRow: 5 },
                ],
            },
            center: {
                top: [
                    { cols: 8, rows: 2, startRow: 0 },
                    { cols: 9, rows: 1, startRow: 2 },
                    { cols: 10, rows: 2, startRow: 3 },
                    { cols: 11, rows: 1, startRow: 5 },
                    { cols: 12, rows: 2, startRow: 6 },
                    { cols: 13, rows: 1, startRow: 8 },
                    { cols: 14, rows: 2, startRow: 9 },
                ],
                bottom: [
                    { cols: 7, rows: 2, startRow: 0 },
                    { cols: 8, rows: 2, startRow: 2 },
                    { cols: 9, rows: 2, startRow: 4 },
                    { cols: 10, rows: 3, startRow: 6 },
                    { cols: 11, rows: 2, startRow: 9 },
                    { cols: 10, rows: 1, startRow: 11 },
                ],
            },
            right: {
                top: [
                    { cols: 5, rows: 1, startRow: 0 },
                    { cols: 7, rows: 3, startRow: 1 },
                    { cols: 5, rows: 4, startRow: 4 },
                    { cols: 3, rows: 1, startRow: 8 },
                ],
                bottom: [
                    { cols: 8, rows: 3, startRow: 0 },
                    { cols: 6, rows: 2, startRow: 3 },
                    { cols: 7, rows: 4, startRow: 5 },
                    { cols: 5, rows: 1, startRow: 9 },
                ],
            },
        },
        floor2: {
            left: [
                { cols: 10, rows: 4, startRow: 0 },
                { cols: 9, rows: 3, startRow: 4 },
            ],
            center: [
                { cols: 12, rows: 5, startRow: 0 },
                { cols: 11, rows: 4, startRow: 5 },
            ],
            right: [
                { cols: 10, rows: 4, startRow: 0 },
                { cols: 9, rows: 3, startRow: 4 },
            ],
        },
    };
    // Fetch reserved seats from API
    async function fetchReservedSeats() {
        try {
            const response = await fetch('/api/seats');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                reservedSeatIds = data.reservedSeats || [];
                console.log(`Loaded ${reservedSeatIds.length} reserved seats:`, reservedSeatIds);
                errorMessage = '';
            } else {
                console.error('API returned error:', data.error);
                errorMessage = 'Failed to load reserved seats. All seats shown as available.';
                reservedSeatIds = [];
            }
        } catch (error) {
            console.error('Error fetching reserved seats:', error);
            errorMessage = 'Could not connect to reservation system. All seats shown as available.';
            reservedSeatIds = [];
        }
    }
    // Calculate total seats
    function calculateTotalSeats() {
        let floor1Total = 0;
        let floor2Total = 0;
        ['left', 'center', 'right'].forEach(section => {
            ['top', 'bottom'].forEach(area => {
                layout.floor1[section][area].forEach(block => {
                    floor1Total += block.cols * block.rows;
                });
            });
        });
        ['left', 'center', 'right'].forEach(section => {
            layout.floor2[section].forEach(block => {
                floor2Total += block.cols * block.rows;
            });
        });
        return { floor1: floor1Total, floor2: floor2Total, total: floor1Total + floor2Total };
    }
    const seatCounts = calculateTotalSeats();
    // Initialize seats with status based on reserved IDs
    function initializeSeats() {
        const seatData = {};
        let seatNumber = 1;
        // Floor 1 seats
        const sections = ["left", "center", "right"];
        const areas = ["top", "bottom"];
        areas.forEach((area) => {
            sections.forEach((section) => {
                layout.floor1[section][area].forEach((block) => {
                    for (let row = 0; row < block.rows; row++) {
                        for (let col = 0; col < block.cols; col++) {
                            const seatId = `floor1-${section}-${area}-${block.startRow + row}-${col}`;
                            const isReserved = reservedSeatIds.includes(seatNumber);
                            
                            seatData[seatId] = {
                                status: isReserved ? "reserved" : "available",
                                number: seatNumber,
                                floor: 1,
                                section,
                                area,
                                row: block.startRow + row,
                                col,
                            };
                            seatNumber++;
                        }
                    }
                });
            });
        });
        // Floor 2 seats
        sections.forEach((section) => {
            layout.floor2[section].forEach((block) => {
                for (let row = 0; row < block.rows; row++) {
                    for (let col = 0; col < block.cols; col++) {
                        const seatId = `floor2-${section}-${block.startRow + row}-${col}`;
                        const isReserved = reservedSeatIds.includes(seatNumber);
                        
                        seatData[seatId] = {
                            status: isReserved ? "reserved" : "available",
                            number: seatNumber,
                            floor: 2,
                            section,
                            row: block.startRow + row,
                            col,
                        };
                        seatNumber++;
                    }
                }
            });
        });
        return seatData;
    }
    // Load data on component mount
    onMount(async () => {
        await fetchReservedSeats();
        seats = initializeSeats();
        isLoading = false;
    });
    function toggleSeat(seatId) {
        if (seats[seatId].status === "reserved") {
            // Show alert or toast that seat is reserved
            alert(`Seat ${seats[seatId].number} is specially reserved and cannot be selected.`);
            return;
        }
        // If clicking on already selected seat, deselect it
        if (seats[seatId].status === "selected") {
            seats[seatId].status = "available";
            seats = seats;
            return;
        }
        // If trying to select a new seat when one is already selected
        const currentlySelected = Object.keys(seats).find(
            key => seats[key].status === "selected"
        );
        if (currentlySelected) {
            alert("You can only select 1 seat at a time. Please deselect your current seat first.");
            return;
        }
        // Select the seat
        seats[seatId].status = "selected";
        seats = seats;
    }
    function getSeatClass(status) {
        const base =
            "w-7 h-7 m-0.5 rounded cursor-pointer transition-all duration-200 active:scale-95 border flex items-center justify-center text-xs font-medium";
        switch (status) {
            case "available":
                return `${base} bg-gray-800 hover:bg-amber-300 hover:text-black border-amber-500/30 hover:border-amber-500 text-white`;
            case "selected":
                return `${base} bg-amber-400 hover:bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/50 text-black`;
            case "reserved":
                return `${base} bg-red-900 border-red-700 cursor-not-allowed opacity-70 text-red-300`;
            default:
                return base;
        }
    }
    $: selectedSeatNumber = Object.entries(seats).find(
        ([_, seat]) => seat.status === "selected"
    )?.[1]?.number || null;
    $: reservedSeatsCount = Object.entries(seats).filter(
        ([_, seat]) => seat.status === "reserved",
    ).length;
</script>
<div class="p-8 bg-black min-h-screen mb-32">
    {#if isLoading}
        <div class="flex flex-col items-center justify-center min-h-screen gap-4">
            <div class="text-amber-500 text-2xl animate-pulse">Loading seat availability...</div>
            <div class="text-amber-400/60 text-sm">Checking reservations from Google Sheets</div>
        </div>
    {:else}
        <div class="max-w-7xl mx-auto">
            {#if errorMessage}
                <div class="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded mb-6">
                    ⚠️ {errorMessage}
                </div>
            {/if}
            <!-- Floor Selector -->
            <div class="flex justify-center gap-4 mb-8">
                <button
                    class={`px-8 py-3 rounded-lg font-semibold transition-all ${
                        currentFloor === 1
                            ? "gold-bg text-black shadow-lg shadow-amber-500/50"
                            : "bg-gray-800 text-amber-400 border border-amber-500/30 hover:bg-gray-700"
                    }`}
                    on:click={() => (currentFloor = 1)}
                >
                    Floor 1
                </button>
                <button
                    class={`px-8 py-3 rounded-lg font-semibold transition-all ${
                        currentFloor === 2
                            ? "gold-bg text-black shadow-lg shadow-amber-500/50"
                            : "bg-gray-800 text-amber-400 border border-amber-500/30 hover:bg-gray-700"
                    }`}
                    on:click={() => (currentFloor = 2)}
                >
                    Floor 2
                </button>
            </div>
            <h1 class="text-4xl font-bold text-center mb-12 gold-text">
                Floor {currentFloor} - Seat Reservation
            </h1>
            {#if currentFloor === 1}
                <!-- FLOOR 1 LAYOUT -->
                <div class="flex justify-between items-start gap-8 mb-8">
                    <!-- Left Section Top -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor1.left.top as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor1-left-top-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <!-- Center Section Top -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor1.center.top as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor1-center-top-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <!-- Right Section Top -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor1.right.top as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor1-right-top-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
                <!-- Gap Divider -->
                <div class="relative my-12">
                    <div class="border-t-2 border-amber-500/30"></div>
                </div>
                <!-- Bottom Section -->
                <div class="flex justify-between items-start gap-8 mb-8">
                    <!-- Left Section Bottom -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor1.left.bottom as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor1-left-bottom-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <!-- Center Section Bottom -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor1.center.bottom as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor1-center-bottom-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <!-- Right Section Bottom -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor1.right.bottom as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor1-right-bottom-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {:else}
                <!-- FLOOR 2 LAYOUT -->
                <div class="flex justify-between items-start gap-8 mb-8">
                    <!-- Left Section -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor2.left as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor2-left-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <!-- Center Section -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor2.center as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor2-center-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <!-- Right Section -->
                    <div class="flex-1">
                        <div class="flex flex-col items-center space-y-1">
                            {#each layout.floor2.right as block}
                                <div class="flex flex-col">
                                    {#each Array(block.rows) as _, rowIdx}
                                        <div class="flex">
                                            {#each Array(block.cols) as _, colIdx}
                                                {@const seatId = `floor2-right-${block.startRow + rowIdx}-${colIdx}`}
                                                <button
                                                    class={getSeatClass(seats[seatId].status)}
                                                    on:click={() => toggleSeat(seatId)}
                                                    title={`Seat ${seats[seatId].number}${seats[seatId].status === 'reserved' ? ' (Special Reservation)' : ''}`}
                                                >
                                                    {seats[seatId].number}
                                                </button>
                                            {/each}
                                        </div>
                                    {/each}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/if}
            <!-- Legend and Info -->
            <div class="bg-zinc-900 p-6 rounded-lg border border-amber-500/30 shadow-xl">
                <div class="flex justify-between items-center">
                    <div class="flex gap-6">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-gray-800 border border-amber-500/30 rounded"></div>
                            <span class="text-gray-300">Available</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-amber-400 border border-amber-400 rounded shadow-lg shadow-amber-500/50"></div>
                            <span class="text-gray-300">Selected</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 bg-red-900 border border-red-700 rounded opacity-70"></div>
                            <span class="text-gray-300">Reserved ({reservedSeatsCount})</span>
                        </div>
                    </div>
                    <div class="flex gap-4 flex-row items-center justify-center">
                        <div class="text-lg font-semibold text-gray-300">
                            Selected Seat: 
                            <span class="text-amber-500 text-xl">
                                {#if selectedSeatNumber}
                                    #{selectedSeatNumber}
                                {:else}
                                    None
                                {/if}
                            </span>
                        </div>
                        <RegistrationForm selectedSeat={selectedSeatNumber} />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>