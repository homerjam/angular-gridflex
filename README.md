# angular-gridflex

Angular directive that creates a justified grid of elements using flexbox

## Installation

`npm install angular-gridflex`

## Demo

http://homerjam.github.io/angular-gridflex/

## Usage

A `data-ratio` attribute is required to calculate to determine sizes and layout, this should be calculated as `width / height`, alternatively `ratio` available on the item scope

    <div class="gridflex" hj-gridflex="{itemSelector: '.item', perRow: 5, averageRatio: 1.5, gutter: 10, repeatCollection: 'items'}">

    	<div ng-repeat="item in items" class="item" data-ratio="{{item.ratio}}" style="background-color: {{item.color}}"></div>

    </div>
