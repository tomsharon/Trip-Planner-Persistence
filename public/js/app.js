//HEART OF MY FRONT END


$(function () {

    var setDay;

    var map = initialize_gmaps();

    var placeMapIcons = {
        activities: '/images/star-3.png',
        restaurants: '/images/restaurant.png',
        hotels: '/images/lodging_0star.png'
    };
        
    var days = [
        []
    ];

    var currentDay = 1;


    var $dayButtons = $('.day-buttons');
    var $addDayButton = $('.add-day');
    var $placeLists = $('.list-group');
    var $dayTitle = $('#day-title');
    var $addPlaceButton = $('.add-place-button');

    var createItineraryItem = function (placeName) {

        var $item = $('<li></li>');
        var $div = $('<div class="itinerary-item"></div>');

        $item.append($div);
        $div.append('<span class="title">' + placeName + '</span>');
        $div.append('<button class="btn btn-xs btn-danger remove btn-circle">x</button>');

        return $item;

    };

    var setDayButtons = function () {
        $dayButtons.find('button').not('.add-day').remove();
        days.forEach(function (day, index) {
            $addDayButton.before(createDayButton(index + 1));
        });
    };

    var getPlaceObject = function (typeOfPlace, nameOfPlace) {

        var placeCollection = window['all_' + typeOfPlace];

        return placeCollection.filter(function (place) {
            return place.name === nameOfPlace;
        })[0];

    };

    var getIndexOfPlace = function (nameOfPlace, collection) {
        var i = 0;
        for (; i < collection.length; i++) {
            if (collection[i].place.name === nameOfPlace) {
                return i;
            }
        }
        return -1;
    };

    var createDayButton = function (dayNum) {
        return $('<button class="btn btn-circle day-btn"></button>').text(dayNum);
    };

    var reset = function () {

        var dayPlaces = days[currentDay - 1];
        if (!dayPlaces) return;

        $placeLists.empty();

        dayPlaces.forEach(function (place) {
            place.marker.setMap(null);
        });

    };

    var removeDay = function (dayNum) {

        if (days.length === 1) return;

        reset();

        days.splice(dayNum - 1, 1);

        setDayButtons();
        setDay(1);

    };

    var mapFit = function () {

        var bounds = new google.maps.LatLngBounds();
        var currentPlaces = days[currentDay - 1];

        currentPlaces.forEach(function (place) {
            bounds.extend(place.marker.position);
        });

        map.fitBounds(bounds);

    };

    setDay = function (dayNum) {

        if (dayNum > days.length || dayNum < 0) {
            return;
        }
        console.log(dayNum)
        var placesForThisDay = days[dayNum - 1];

        var $dayButtons = $('.day-btn').not('.add-day');

        reset();

        currentDay = dayNum;

        placesForThisDay.forEach(function (place) {
            $('#' + place.section + '-list').find('ul').append(createItineraryItem(place.place.name));
            place.marker.setMap(map);
        });

        $dayButtons.removeClass('current-day');
        $dayButtons.eq(dayNum - 1).addClass('current-day');

        $dayTitle.children('span').text('Day ' + dayNum.toString());

        mapFit();

    };

    $addPlaceButton.on('click', function () {

        var $this = $(this);
        var sectionName = $this.parent().attr('id').split('-')[0];
        var $listToAppendTo = $('#' + sectionName + '-list').find('ul');
        var placeName = $this.siblings('select').val();
        var placeObj = getPlaceObject(sectionName, placeName);

        var createdMapMarker = drawLocation(map, placeObj.place[0].location, {
            icon: placeMapIcons[sectionName]
        });

        days[currentDay - 1].push({place: placeObj, marker: createdMapMarker, section: sectionName});
        $listToAppendTo.append(createItineraryItem(placeName));

        //Long way to do an ajax POST request
        $.ajax({
            method: "POST",
            url: "/api/days/" + currentDay + "/" + sectionName,
            data: { name: placeName },
            success: function(responseData) {
                console.log(responseData)
            },
            error: function(errorObj) {
                console.log(errorObj);
            }
        })

        //Short way to do an AJAX POST request ($.post is just a wrapper around $.ajax specific for POST requests)
        //PROMISE APPROACH. Jquery uses .done() instead of .then() for promises
        $.post("/api/days/" + currentDay + "/" + sectionName, {name: placeName})
            .done(function(responseData) {
                console.log(responseData);
            })         

        //CALLBACK APPROACH for an ajax post request        
        $.post("/api/days/" + currentDay + "/" + sectionName, {name: placeName}, function(responseData) {
            console.log(responseData)
        })        

        mapFit();

    });

    $placeLists.on('click', '.remove', function (e) {

        var $this = $(this);
        var $listItem = $this.parent().parent();
        var nameOfPlace = $this.siblings('span').text();
        var indexOfThisPlaceInDay = getIndexOfPlace(nameOfPlace, days[currentDay - 1]);
        var placeInDay = days[currentDay - 1][indexOfThisPlaceInDay];

        placeInDay.marker.setMap(null);
        days[currentDay - 1].splice(indexOfThisPlaceInDay, 1);
        $listItem.remove();

    });

    $dayButtons.on('click', '.day-btn', function () {
        var $this = $(this);
          var dayNum = +$this.text();
          if(!$this.hasClass("add-day")) {
            $.ajax({
              method: "GET",
              url: "/api/days/" + dayNum,
              success: function(returnedDay) {
                days[dayNum - 1].push({place: returnedDay[0].hotel, marker: drawLocation(map, returnedDay[0].hotel.place[0].location, placeMapIcons.hotels), section: "hotels"})
                console.log(returnedDay)
                setDay(dayNum);
              }
            })
        }
    });

    $addDayButton.on('click', function () {

        var currentNumOfDays = days.length;
        var newDayNum = currentNumOfDays + 1
        var $newDayButton = createDayButton(newDayNum);

        $addDayButton.before($newDayButton);
        days.push([]);
        setDayButtons();
        setDay(currentNumOfDays + 1);


        //PROMISE APPROACH for an ajax post request. Jquery uses .done() instead of .then() for promises
        $.post("/api/days/new_day", {number: currentNumOfDays + 1})
            .done(function(responseData) {
                console.log("Successfully added day " + newDayNum + " into your database. Check it out below:")
                console.dir(responseData)        
            })

        //CALLBACK APPROACH for an ajax post request
        // $.post("/api/days/new_day", {number: currentNumOfDays + 1}, function(responseData) {
        //     console.log("Successfully added day " + newDayNum + " into your database. Check it out below:")
        //     console.dir(responseData)
        // })

    });

    $dayTitle.children('button').on('click', function () {

        removeDay(currentDay);

    });

});

