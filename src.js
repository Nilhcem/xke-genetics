// Feel free to modify these data to improve the algorithm
var POPULATION_SIZE = 50;
var MUTATION_RATE = 0.03;
var REFRESH_TIMEOUT = 100;

// Internal data - should not be modified
var CHROMOSOME_CRITERIA = new Array('head', 'hair', 'nose', 'mouth', 'eye_right', 'eye_left', 'eyebrow_right', 'eyebrow_left', 'ear_right', 'ear_left');
var CHROMOSOME_MAX_VALUE_PER_CRITERIA = new Array(8, 11, 9, 10, 8, 9, 8, 8, 5, 5);
var PERFECT_CHROMOSOME = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
var NB_CRITERIA = CHROMOSOME_CRITERIA.length;

var Chromosome = function(criteria) {
    // Lower is better - Initialized by default with an arbitrary chosen huge amount
    this.fitness_score = 9999;

    // Initialize object members with criteria in parameters or random data if undefined
    for (var i = 0; i < NB_CRITERIA; i++) {
        this[CHROMOSOME_CRITERIA[i]] = (criteria ? criteria[i] : get_random_number(CHROMOSOME_MAX_VALUE_PER_CRITERIA[i]));
    }
};
Chromosome.prototype.mutate = function() {
    if (Math.random() <= MUTATION_RATE) {
        // We will mutate a random attribute with a random value
        var selected_base = get_random_number(NB_CRITERIA);
        this[CHROMOSOME_CRITERIA[selected_base]] = get_random_number(CHROMOSOME_MAX_VALUE_PER_CRITERIA[selected_base]);
    }
};
Chromosome.prototype.calculate_fitness = function() {
    var total = 0;

    for (i = 0; i < NB_CRITERIA; i++) {
        total += Math.abs(this[CHROMOSOME_CRITERIA[i]] - PERFECT_CHROMOSOME[i]);
    }
    this.fitness_score = total;
};
Chromosome.prototype.crossover = function(parent1, parent2) {
    // Use a randomized pivot in [1, 9]
    var pivot = get_random_number(NB_CRITERIA - 1) + 1;
    // if you want to test how mutations are important, uncomment the following line
    // var pivot = get_random_number(NB_CRITERIA - 3) + 3;

    var child1 = new Array();
    var child2 = new Array();

    for (var i = 0; i < NB_CRITERIA; i++) {
        var criteria = CHROMOSOME_CRITERIA[i];
        if (i < pivot) {
            child1[i] = parent1[criteria];
            child2[i] = parent2[criteria];
        } else {
            child1[i] = parent2[criteria];
            child2[i] = parent1[criteria];
        }
    }
    return [new Chromosome(child1), new Chromosome(child2)];
};

var Population = function() {
    this.members = [];
    this.generationNumber = 0;

    for (var i = 0; i < POPULATION_SIZE; i++) {
        this.members.push(new Chromosome());
    }
};
Population.prototype.sort = function() {
    this.members.sort(function(a, b) {
        return a.fitness_score - b.fitness_score;
    });
};
Population.prototype.process = function() {
    for (var i = 0; i < POPULATION_SIZE; i++) {
        this.members[i].calculate_fitness();
    }

    this.sort();

    // Exit condition
    if (this.members[0].fitness_score == 0) {
        return true;
    }

    // Natural selection
    var new_population = [];
    var i = 0;
    while ((i + 1) < POPULATION_SIZE) {
        var parent1 = this.members[i];
        var parent2 = this.members[i + 1];
        i += 2;
        Array.prototype.push.apply(new_population, Chromosome.prototype.crossover(parent1, parent2));
    }
    this.members = new_population;
    this.generationNumber++;

    // Mutation
    for (i = 0; i < POPULATION_SIZE; i++) {
        this.members[i].mutate();
    }

    // Relaunch same method
    var scope = this;
    setTimeout(function() {
        scope.process();
    }, (this.generationNumber < 20 ? 4 * REFRESH_TIMEOUT : REFRESH_TIMEOUT));
};

function get_random_number(max_exclusive) {
    return Math.floor(Math.random() * max_exclusive);
}

new Population().process();
