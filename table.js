

let table_element = document.getElementById("game-table-body");
let game_table = []; // game table will be a 2d array which will represent
let paths = [];
let paths_tracker = [];

let draw_path = false;
let draw_left_border = false;
let draw_right_border = false;
let draw_top_border = false;
let draw_bottom_border = false;

let draw_left_button = document.getElementById('draw_left_border');
let draw_right_button = document.getElementById('draw_right_border');
let draw_top_button = document.getElementById('draw_top_border');
let draw_bottom_button = document.getElementById('draw_bottom_border');
let find_paths = document.getElementById('find_paths');


function clearPreviousSelection() {
    draw_left_button.setAttribute('style', 'background-color:white');
    draw_right_button.setAttribute('style', 'background-color:white');
    draw_top_button.setAttribute('style', 'background-color:white');
    draw_bottom_button.setAttribute('style', 'background-color:white');

    draw_left_border = false;
    draw_right_border = false;
    draw_top_border = false;
    draw_bottom_border = false;
}

draw_left_button.addEventListener('click', function () {
    clearPreviousSelection();
    draw_left_button.setAttribute('style', 'background-color:yellow');
    draw_left_border = true;
});

draw_right_button.addEventListener('click', function () {
    clearPreviousSelection();
    draw_right_button.setAttribute('style', 'background-color:yellow');
    draw_right_border = true;
});

draw_top_button.addEventListener('click', function () {
    clearPreviousSelection();
    draw_top_button.setAttribute('style', 'background-color:yellow');
    draw_top_border = true;
});

draw_bottom_button.addEventListener('click', function () {
    clearPreviousSelection();
    draw_bottom_button.setAttribute('style', 'background-color:yellow');
    draw_bottom_border = true;
});

find_paths.addEventListener('click', function () {
    findPaths();
});

function createChunk(myArray, chunk_size) {
    let arrayLength = myArray.length;
    let tempArray = [];

    for (let index = 0; index < arrayLength; index += chunk_size) {
        let myChunk = myArray.slice(index, index + chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}

function focusInput(row, col) {
    console.log(row, col);
    // check if draw left border is true than make the game_table[row][col].right = true
    if (draw_left_border) {
        // previous column add the right as the same value
        if (col !== 0) {
            game_table[row][col - 1].right = !game_table[row][col].left;
        }
        game_table[row][col].left = !game_table[row][col].left;
    } else if (draw_right_border) {
        // next column add the left as the same value
        if (col !== game_table.length - 1) {
            game_table[row][col + 1].left = !game_table[row][col].right;
        }
        game_table[row][col].right = !game_table[row][col].right;
    } else if (draw_top_border) {
        // previous row add the bottom as the same value
        if (row !== 0) {
            game_table[row - 1][col].bottom = !game_table[row][col].top;
        }
        game_table[row][col].top = !game_table[row][col].top;
    } else if (draw_bottom_border) {
        // next row add the top as the same value
        if (row !== game_table.length - 1) {
            game_table[row + 1][col].top = !game_table[row][col].bottom;
        }
        game_table[row][col].bottom = !game_table[row][col].bottom;
    }
    updateTable();
}

function updateTable() {
    // loop through the game table array
    table_element.innerHTML = '';
    for (let i = 0; i < game_table.length; i++) {
        let table_row = '<tr>'
        for (let j = 0; j < game_table.length; j++) {
            let left_border = game_table[i][j].left ? 'left_border' : '';
            let right_border = game_table[i][j].right ? 'right_border' : '';
            let top_border = game_table[i][j].top ? 'top_border' : '';
            let bottom_border = game_table[i][j].bottom ? 'bottom_border' : '';
            table_row += `<td class='${left_border} ${right_border} ${top_border} ${bottom_border}' onclick="focusInput(${i}, ${j})">${game_table[i][j].value}</td>`;
        }
        table_row += '</tr>';
        table_element.innerHTML += table_row;
    }
}

function previousConnectionRow(new_paths) {
    let found_row_index = -1;
    for (let i = 0; i < new_paths.length; i++) {

        for (let row = 0; row < paths.length; row++) {
            for (let col = 0; col < paths[row].length; col++) {
                // checking if this is the immediate top row
                if (new_paths[i].col === paths[row][col].col && new_paths[i].row === paths[row][col].row + 1) {
                    if (!game_table[new_paths[i].row - 1][new_paths[i].col].bottom) {
                        found_row_index = row;
                        return found_row_index;
                    }
                }
            }
        }
    }
    return found_row_index;
}

function explorePaths() {

    // forEach path in the path_trackers check connection with the previous row
    // path_trackers is a 2d array
    for (let i = 0; i < paths_tracker.length; i++) {
        let path_row = previousConnectionRow(paths_tracker[i]);

        if(path_row !== -1){
            // this is a part of previously explored path
            for(let j = 0;j < paths_tracker[i].length;j++){
                paths[path_row].push(paths_tracker[i][j]);
            }
        } else{
            // this one is a newly explored path
            paths.push(paths_tracker[i]);
        }
    }
}

function findPaths() {
    // here scaning the first row and exploring all new paths
    for (let j = 0; j < game_table.length; j++) {
        checkConnection(0, j, paths);
    }

    // here scan the game table from the 2nd row i=1
    // here will get the new_paths 
    // after getting the new_paths needs to check if new_paths any path has connection with previously explored paths path
    // if any path has connection with previously explored path then new_paths is a part of that paths
    // if no connection with previously explored path then this needs to be added to paths as a new_paths

    for (let i = 1; i < game_table.length; i++) {
        for (let j = 0; j < game_table.length; j++) {
            checkConnection(i, j, paths_tracker);
        }

        explorePaths(paths_tracker);
        // here check paths_tracker paths with the previously explored paths
        // and finally make the paths_tracker array empty
        paths_tracker = [];
    }
    console.log(paths);
}

function addToPath(preRow, preCol, row, col, paths_array) {
    // find preRow and preCol inside which path then in that path add this row, col
    let foundRow = 0;

    for (let i = 0; i < paths_array.length; i++) {
        for (let j = 0; j < paths_array[i].length; j++) {
            if (paths_array[i][j].row === preRow && paths_array[i][j].col === preCol) {
                foundRow = i;
                break;
            }
        }
    }

    paths_array[foundRow].push({ row, col });
}

function checkConnection(row, col, paths_array) {
    // check if the next column has connection with the previous column
    // check if the next row has connection with the previous row
    // current row, col will check with row, col -1 data and row - 1, col
    // (row, col - 1) means previous column table[row][col-1].right = false means has connection with the previous column
    // (row - 1, col) means previous row table[row-1][col].bottom = false means has connection with the previous row

    if (col === 0) {
        // here we don't need to check any connection. this is the first node
        // we just need to add this node into the paths
        let new_path = [];
        new_path.push({ row, col });
        paths_array.push(new_path);
    } else {
        // here need to check only previous col
        if (!game_table[row][col - 1].right) {
            addToPath(row, col - 1, row, col, paths_array);
        } else {
            // create this one as the new path
            let new_path = [];
            new_path.push({ row, col });
            paths_array.push(new_path);
        }
    }
}

function initializeTable() {
    // 9 * 9 grid
    let arr = [];

    for (let i = 0; i < 81; i++) {
        arr.push({ value: '0', left: false, right: false, top: false, bottom: false });
    }

    game_table = createChunk(arr, 9);
    updateTable();
}

initializeTable();