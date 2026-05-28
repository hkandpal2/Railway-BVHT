const faultDatabase = {

    ejectorChoke: {
        title: "Ejector Choking",

        symptoms: [
            "Low vacuum generation",
            "Incomplete flushing",
            "Weak suction",
            "Back pressure in intermediate tank"
        ],

        causes: [
            "Black pneumatic line contamination",
            "Waste accumulation inside ejector",
            "No positive pressure cleaning cycle"
        ],

        solutions: [
            "Remove ejector assembly",
            "Blow compressed air through ejector",
            "Clean black pneumatic tube",
            "Check silencer blockage"
        ]
    },

    reverseFlush: {
        title: "Reverse Flushing",

        symptoms: [
            "Waste returning to toilet bowl",
            "Pressure inside lavatory pan",
            "Unsafe flush cycle"
        ],

        causes: [
            "Inlet valve opened during pressure cycle",
            "Software interlock failure",
            "Vacuum sensor malfunction"
        ],

        solutions: [
            "Check inlet pinch valve",
            "Verify PLC logic",
            "Check digital vacuum sensor",
            "Ensure 75% vacuum before inlet opening"
        ]
    },

    pinchValveFailure: {
        title: "Pinch Valve Failure",

        symptoms: [
            "Water bubbling in pan",
            "Leakage",
            "Poor flushing"
        ],

        causes: [
            "Inner hose deformation",
            "Valve aging",
            "Improper sealing"
        ],

        solutions: [
            "Replace pinch valve",
            "Inspect valve sleeve",
            "Check pneumatic pressure"
        ]
    }

};
