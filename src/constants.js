const NO_OF_OVERS = 4;

const STATUS ={
    ACTIVE:{
        id:1,
        text:'batting'
    },
    ON_OPPOSITE_CREASE:{
        id:2,
        text:'not batting'
    },
    INACTIVE:{
        id:3,
        text:'not played yet'
    },
    OUT:{
        id:0,
        text:'Out'
    }
}

const PLAYER_PROBABILITY = {
    P1:{
        name:'Kirat Bohli',
        0:0.05,
        1:0.05,
        2:0.25,
        3:0.10,
        4:0.15,
        5:0.01,
        6:0.09,
        7:0.30 //probability of getting out
    },
    P2:{
        name:'N.S Bodhi',
        0:0.10 ,
        1:0.40,
        2:0.20,
        3:0.05,
        4:0.10,
        5:0.01,
        6:0.04,
        7:0.10 //probability of getting out
    },
    P3:{
        name:'R Bumrah',
        0:0.20 ,
        1:0.30,
        2:0.15,
        3:0.05,
        4:0.05,
        5:0.01,
        6:0.04,
        7:0.20 //probability of getting out
    },
    P4:{
        name:'Shashi Henra',
        0:0.30 ,
        1:0.25,
        2:0.05,
        3:0.00,
        4:0.05,
        5:0.01,
        6:0.04,
        7:0.30 //probability of getting out
    }
}

module.exports = {
    NO_OF_OVERS,
    PLAYER_PROBABILITY,
    STATUS
}