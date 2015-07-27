(function($) {
    'use strict';
    
    /**
    * Variables for design  
    **/
    var $board = $("#checkers_board"),
        boardSquare = 8;
    createBoard();
    
    /**
    *   For game
    **/
    
    var firstPlayerIndex = 1,
        secondPlayerIndex = 2,
        board = setUpStartPosition();
    
    function CellOfBoard (name, checker) {
        var that = this;
        
        this.name = name;
        this.checker = checker?checker:null;
        this.$el = $board.find("#" + name);
        
        if(this.checker !== null) {
            checker.setCell(this);
            checker.show();
        }
        
        this.removeChecker = function () {
            that.checker = null;
            that.$el.html("");
        }
        
        this.addChecker= function (checker) {
            that.checker = checker;
            that.checker.setCell(that);
            that.checker.show();
        }
        
        return this;
    }
    
    function Checker(player) {
        var that = this;
        this.player = player;
        this.cell = null;
        this.cssClass = player === 1?'white':'black';
        this.king = false;

        this.setCell = function (cell) {
            that.cell = cell;
        }
        
        this.becomeKing = function () {
            that.king = true;
        }
        
        this.show = function () {
            if(!that.cell) {
                return false;
            }
            
            var html = this.king?
                '<div class="checker king ' + that.cssClass +'"></div>':
                '<div class="checker ' + that.cssClass +'"></div>';
            
            that.cell.$el.html(html)
         }
        
        return this;
    }
    
    
    startGame();
    
    
    function startGame() {
        var playerMove = firstPlayerIndex,//firstPlayerIndex,
            isBeat = false,
            repeat = 0,
            diagonals = [
                [ board.F1, board.G2, board.H3 ],
                [ board.D1, board.E2, board.F3, board.G4, board.H5 ],
                [ board.B1, board.C2, board.D3, board.E4, board.F5, board.G6, board.H7 ],
                [ board.A2, board.B3, board.C4, board.D5, board.E6, board.F7, board.G8 ],
                [ board.A4, board.B5, board.C6, board.D7, board.E8 ],
                [ board.A6, board.B7, board.C8 ],
                [ board.D1, board.C2, board.B3, board.A4 ],
                [ board.F1, board.E2, board.D3, board.C4, board.B5, board.A6 ],
                [ board.H1, board.G2, board.F3, board.E4, board.D5, board.C6, board.B7, board.A8 ],
                [ board.H3, board.G4, board.F5, board.E6, board.D7, board.C8 ],
                [ board.H5, board.G6, board.F7, board.E8 ],
                [ board.B1, board.A2 ],
                [ board.H7, board.G8 ]
            ],
            royalCells = {
                1 : [ board.A8, board.C8, board.E8, board.G8 ],
                2 : [ board.B1, board.D1, board.F1, board.H1 ]
            };
        
        checkAllIsBeat();
        notificationOfMove();

        $board.on("click", ".checker", function () {
            
            if(repeat) {
                return false;
            }
            
            var cell = getCellByName($(this).parent().attr("id"));
            
            clearSelect();
            
            if(cell.checker.player !== playerMove) {
                alert("Сейчас не ваш ход");
                return;
            }
            
            cell.$el.addClass("active");
            
            if(isBeat) {
                beatMove(cell);
                return;
            }
            
            usualMove(cell);
        });
        
        $board.on("click", ".perspective", function () {
            var fromCell = getCellByName($board.find(".active").attr("id")),
                toCell = getCellByName($(this).attr("id"));
            
            makeMove(fromCell, toCell);
        });
        
        
        
        function notificationOfMove () {
            alert("Ходит игрок " + playerMove)
        }
        
        function makeMove(fromCell, toCell) {
            
            fromCell.$el.children(".checker").animate({
                top: -(fromCell.$el.offset().top - toCell.$el.offset().top),
                left: -(fromCell.$el.offset().left - toCell.$el.offset().left)
            }, {
                duration : 100,
                queue: false,
                easing : 'linear',
                complete : function () {
                    window.setTimeout(function () {
                        swapChecker(fromCell, toCell);
                        if(isBeat) {
                            toCell.checker.king?
                                getCellOfKilledCheckerByKing(fromCell, toCell).removeChecker():
                                getCellOfKilledChecker(fromCell, toCell).removeChecker();
                            if(beatMove(toCell)) {
                                toCell.$el.addClass("active");
                                repeat++;
                                return;
                            }
                            
                        }
                        
                        changeMove();
                    }, 390);
                }
            });
            clearSelect();
        }
        
        function isNewKing(cell) {
            for(var i = 0; i < royalCells[playerMove].length; i++) {
                if(royalCells[playerMove][i] === cell) {
                    return true;
                }
            }
            return false;
        }
        
        function swapChecker (from, to) {
            var checker = from.checker;
            from.removeChecker();
            if(isNewKing(to)) {
                checker.becomeKing();
            }
            to.addChecker(checker);
        }
        
        function changeMove() {
            if(repeat > 0) {
                alert("Комбо из " + (repeat + 1));
            }
            repeat = 0;
            isBeat = false;
            playerMove = playerMove === 1?2:1;
            checkAllIsBeat();
            notificationOfMove();
        }
        
        function getCellOfKilledChecker(from, to) {
            search:
            for(var i = 0; i < diagonals.length; i++) {
                var diagonal = diagonals[i];
                for( var j = 0; j < diagonal.length; j++) {
                    if(diagonal[j] === from) {
                         if(diagonal[j + 2] === to) {
                             return diagonal[j + 1];
                         }
                        else if(diagonal[j - 2] === to) {
                            return diagonal[j - 1];
                        }
                    }
                }
            }
            
            return null;
        }
        
        function getCellOfKilledCheckerByKing(from, to) {
            for(var i = 0; i < diagonals.length; i++) {
                var diagonal = diagonals[i],
                    fromIndex = -1,
                    toIndex = -1;
                
                for(var j = 0; j < diagonal.length; j++) {
                    if(diagonal[j] === from) {
                        fromIndex = j;
                    }
                    if(diagonal[j] === to) {
                        toIndex = j;
                    }
                    
                    if(fromIndex > -1 && toIndex > -1) {
                        break;
                    }
                }
                
                if(fromIndex > -1 && toIndex > -1) {
                    var k = fromIndex
                    
                    while (k !== toIndex) {
                        if(diagonal[k] && isChecker(diagonal[k])) {
                            return diagonal[k];
                        }
                        k = fromIndex > toIndex?--k:++k;
                    }
                }
                
                
            }
            
            return false;
        }
        
        
        
        function usualMove(cell) {           
            var factor = playerMove === firstPlayerIndex?1:-1;
            
            for(var i = 0; i < diagonals.length; i++) {
                var diagonal = diagonals[i];
                for( var j = 0; j < diagonal.length; j++) {
                    
                    if(diagonal[j] === cell && cell.checker.king) {
                        findUsualMoveOfKing(j, diagonal);
                        continue;
                    }
                    
                    if(diagonal[j] === cell && 
                       diagonal[j + 1 * factor] && !diagonal[j + 1 * factor].checker) {
                        diagonal[j + 1 * factor].$el.addClass("perspective");
                    }
                }
            }
        }
        
        function findUsualMoveOfKing(i, diagonal) {
            for(var k = i; k > 0; k--) { 
                if(diagonal[k - 1] && !isChecker(diagonal[k - 1])) {
                    diagonal[k - 1].$el.addClass("perspective");
                }
                else {
                    break;
                }
                if(diagonal[k - 2] && isChecker(diagonal[k - 2])) {
                    break;
                }
            }
            for(var k = i; k < diagonal.length; k++) {
                if(diagonal[k + 1] && !isChecker(diagonal[k + 1])) {
                    diagonal[k + 1].$el.addClass("perspective");
                }
                if(diagonal[k + 2] && isChecker(diagonal[k + 2])) {
                    break;
                }
            }
        }
        
        function isKingBeat (i, diagonal) {
            for (var k = i; k >= 0; k--) {
                
                if(diagonal[k - 1] && isChecker(diagonal[k - 1]) && isCheckerOfCurrentPlayer(diagonal[k - 1].checker)) {
                    break;
                }
                 if(((diagonal[k] && !isChecker(diagonal[k])) || (isChecker(diagonal[k]) && i === k)) &&
                   diagonal[k - 1] && isChecker(diagonal[k - 1]) && 
                   !isCheckerOfCurrentPlayer(diagonal[k - 1].checker) && 
                   diagonal[k - 2] && !isChecker(diagonal[k - 2])) {
                    return true;
                }
            } 
            
            for (var k = i; k < diagonal.length; k++) {
                
                if(diagonal[k + 1] && isChecker(diagonal[k + 1]) && isCheckerOfCurrentPlayer(diagonal[k + 1].checker)) {
                    break;
                }
                
                
                if(((diagonal[k] && !isChecker(diagonal[k])) || (isChecker(diagonal[k]) && i === k)) &&
                   diagonal[k + 1] && isChecker(diagonal[k + 1]) && 
                   !isCheckerOfCurrentPlayer(diagonal[k + 1].checker) && 
                   diagonal[k + 2] && !isChecker(diagonal[k + 2])) {
                    return true;
                }
            }
            
            return false;        
        }
        
        
        function findBeatMoveOfKing (i, diagonal) {  
            var isFind = false;
            for(var k = i; k >=  0; k--) {
                if(((diagonal[k] && !isChecker(diagonal[k])) ||
                    (isChecker(diagonal[k]) && i === k)) &&
                   diagonal[k - 1] && isChecker(diagonal[k - 1]) && 
                   !isCheckerOfCurrentPlayer(diagonal[k - 1].checker) && 
                   diagonal[k - 2] && !isChecker(diagonal[k - 2])) {
                    var n = k - 1;
                    while(diagonal[n - 1] && !diagonal[n - 1].checker) {
                        if(diagonal[n - 1] && !isChecker(diagonal[n - 1])) {
                            diagonal[n - 1].$el.addClass("perspective");
                            n--;
                            isFind = true;
                        }
                        else {
                            break;
                        }
                    }
                    break;
                }
            }
            
            for (var k = i ; k < diagonal.length; k++) {
                if(((diagonal[k] && !isChecker(diagonal[k])) ||
                    (isChecker(diagonal[k]) && i === k)) &&
                   diagonal[k + 1] && isChecker(diagonal[k + 1]) && 
                   !isCheckerOfCurrentPlayer(diagonal[k + 1].checker) && 
                   diagonal[k + 2] && !isChecker(diagonal[k + 2])) {
                    var n = k + 1;
                    while(diagonal[n + 1] && !diagonal[n + 1].checker) {
                        if(diagonal[n + 1] && !isChecker(diagonal[n + 1])) {
                            diagonal[n + 1].$el.addClass("perspective");
                            n++;
                            isFind = true;
                        }
                        else {
                            break;
                        }
                    }
                    break;
                }
            }
			
            return isFind;
        }
        
        function beatMove (cell) {
            var isMove = false;
            
            for(var i = 0; i < diagonals.length; i++) {
                var diagonal = diagonals[i];
                for( var j = 0; j < diagonal.length; j++) {
                    
                    if(diagonal[j] === cell) {
                        
                        if(diagonal[j].checker.king && isCheckerOfCurrentPlayer(diagonal[j].checker)) {
                            if(findBeatMoveOfKing(j, diagonal)) {
                                isMove = true;
                            }
                        }
                                       
                        if(determinePossibleMovesUpForBeat(j, diagonal)) {
                            diagonal[j - 2].$el.addClass("perspective"); 
                            isMove = true;
                        }
                        
                        if(determinePossibleMovesDownForBeat(j, diagonal)) {
                            diagonal[j + 2].$el.addClass("perspective");
                            isMove = true;
                        }
                    }
                }
            }
            return isMove;
            
        }
        
        function checkAllIsBeat () {
            check:
            for(var i = 0; i < diagonals.length; i++) {
                var diagonal = diagonals[i];
                
                for( var j = 0; j < diagonal.length; j++) {
                    
                    if(diagonal[j] && isChecker(diagonal[j]) && 
                       isCheckerOfCurrentPlayer(diagonal[j].checker) &&
                       diagonal[j].checker.king) {
                        if(isKingBeat(j, diagonal)) {
                            isBeat = true;
                        }
                    }
                    
                    
                    if(determinePossibleMovesUpForBeat(j, diagonal) ||
                       determinePossibleMovesDownForBeat(j, diagonal)) {
                        isBeat = true;
                    }
                    
                }
            }
            
        }
        
        function determinePossibleMovesUpForBeat (i, diagonal) {       
            
            if(diagonal[i] && isChecker(diagonal[i]) && isCheckerOfCurrentPlayer(diagonal[i].checker) &&
               diagonal[i - 1] && isChecker(diagonal[i - 1]) && !isCheckerOfCurrentPlayer(diagonal[i - 1].checker) &&
               diagonal[i - 2] && !isChecker(diagonal[i - 2])) {
                return true;
            }

            return false;
        }
        
        function determinePossibleMovesDownForBeat (i, diagonal) {       
            
            if(diagonal[i] && isChecker(diagonal[i]) && isCheckerOfCurrentPlayer(diagonal[i].checker) &&
               diagonal[i + 1] &&isChecker(diagonal[i + 1]) && !isCheckerOfCurrentPlayer(diagonal[i + 1].checker) &&
               diagonal[i + 2] && !isChecker(diagonal[i + 2])) {
                return true;
            }

            return false;
        }
        
        
        function isChecker (cell) {
            return cell.checker?true:false;
        }
        function isCheckerOfCurrentPlayer (checker) {
            return checker.player === playerMove?true:false;
        }

        function clearSelect () {
            $board.find(".active").removeClass("active");
            $board.find(".perspective").removeClass("perspective");
        }
        
        function getPlayerFactor () {
            return playerMove === firstPlayerIndex?1:-1;
        }
    }
    
    function getCellByName (name) {
        return board[name];
    }
    
    function setUpStartPosition () {
        return {
            B1: new CellOfBoard("B1", new Checker(firstPlayerIndex)),
            D1: new CellOfBoard("D1", new Checker(firstPlayerIndex)),
            F1: new CellOfBoard("F1", new Checker(firstPlayerIndex)),
            H1: new CellOfBoard("H1", new Checker(firstPlayerIndex)),
            A2: new CellOfBoard("A2", new Checker(firstPlayerIndex)),
            C2: new CellOfBoard("C2", new Checker(firstPlayerIndex)),
            E2: new CellOfBoard("E2", new Checker(firstPlayerIndex)),
            G2: new CellOfBoard("G2", new Checker(firstPlayerIndex)),
            B3: new CellOfBoard("B3", new Checker(firstPlayerIndex)),
            D3: new CellOfBoard("D3", new Checker(firstPlayerIndex)),
            F3: new CellOfBoard("F3", new Checker(firstPlayerIndex)),
            H3: new CellOfBoard("H3", new Checker(firstPlayerIndex)),
            A4: new CellOfBoard("A4"),
            C4: new CellOfBoard("C4"),
            E4: new CellOfBoard("E4"),
            G4: new CellOfBoard("G4"),
            B5: new CellOfBoard("B5"),
            D5: new CellOfBoard("D5"),
            F5: new CellOfBoard("F5"),
            H5: new CellOfBoard("H5"),
            A6: new CellOfBoard("A6", new Checker(secondPlayerIndex)),
            C6: new CellOfBoard("C6", new Checker(secondPlayerIndex)),
            E6: new CellOfBoard("E6", new Checker(secondPlayerIndex)),
            G6: new CellOfBoard("G6", new Checker(secondPlayerIndex)),
            B7: new CellOfBoard("B7", new Checker(secondPlayerIndex)),
            D7: new CellOfBoard("D7", new Checker(secondPlayerIndex)),
            F7: new CellOfBoard("F7", new Checker(secondPlayerIndex)),
            H7: new CellOfBoard("H7", new Checker(secondPlayerIndex)),
            A8: new CellOfBoard("A8", new Checker(secondPlayerIndex)),
            C8: new CellOfBoard("C8", new Checker(secondPlayerIndex)),
            E8: new CellOfBoard("E8", new Checker(secondPlayerIndex)),
            G8: new CellOfBoard("G8", new Checker(secondPlayerIndex)),
        }
    }
    
    function createBoard () {
        var boardRows, boardColumn = boardRows = boardSquare,
            alphabetEnd = 65 + boardColumn,
            html = '';
        
        html += '<thead>\n<tr>\n<th>';
        for(var c = 65; c < alphabetEnd; c++) {
            html += '<th>' + String.fromCharCode(c)+"\n";
        }
        
        html += '<th><tbody>';
        for(var i = 1; i < boardRows + 1; i++) {
            html += "<tr>\n";
            html += '<td class="board_symbol">' + i;
            
            for(var j = 0; j < boardColumn; j++) {
                html += '<td id="' + String.fromCharCode(j + 65) + i +'">\n';
            }
            html += '<td class="board_symbol">' + i;
        }
        
        html += '<tfoot>\n<tr>\n<td>';
        for(var c = 65; c < alphabetEnd; c++) {
            html += '<td>' + String.fromCharCode(c)+"\n";
        }
        html += '<td>';
        
        $board.html(html);
    }
})($);