// variables:
var image_data = {
    width: 0,
    height: 0
};

var slider = {
    id: "",
    press: false,
    notch: null
};

var sliders = {
    "brightness": {
        title: "Brightness",
        val: 100,
        def: 100,
        min: 0,
        max: 200,
        units: "%"
    },
    "contrast": {
        title: "Contrast",
        val: 100,
        def: 100,
        min: 0,
        max: 200,
        units: "%"
    },
    "blur": {
        title: "Blur",
        val: 0,
        def: 0,
        min: 0,
        max: 100,
        units: "px"
    },
    "hue-rotate": {
        title: "Hue",
        val: 0,
        def: 0,
        min: 0,
        max: 360,
        units: "deg"
    },
    "saturate": {
        title: "Saturation",
        val: 100,
        def: 100,
        min: 0,
        max: 300,
        units: "%"
    },
    "grayscale": {
        title: "Grayscale",
        val: 0,
        def: 0,
        min: 0,
        max: 100,
        units: "%"
    },
    "sepia": {
        title: "Sepia",
        val: 0,
        def: 0,
        min: 0,
        max: 100,
        units: "%"
    },
    "opacity": {
        title: "Opacity",
        val: 100,
        def: 100,
        min: 0,
        max: 100,
        units: "%"
    }
};

var filters = "";


// jQuery:
$(document).ready(function() {

    // upload photo:
    $(document).on("click", "button.photo-upload", function() {
        $("input#file").trigger("click");
    });


    // on file select:
    $(document).on("change", "input#file", function() {
        var file = $(this)[0].files[0];
        var fr = new FileReader();

        fr.onloadend = function(event) {
            var image = new Image();

            image.onload = function() {
                image_data.width  = this.width;
                image_data.height = this.height;
            };

            image.src = event.target.result;

            $("div#photo img").attr("src", fr.result);
            $("div#photo").show();

            var output = "";

            for (var key in sliders) {
                var pos = Math.round((sliders[key].val / sliders[key].max) * 100);

                output += `
                    <div class="row">
                        <div class="col-lg-9 col-md-9 col-sm-9">
                            <label>` + sliders[key].title + `</label>
                            <div class="slider" data-id="` + key + `" data-value="` + sliders[key].val + `" data-min="` + sliders[key].min + `" data-max="` + sliders[key].max + `">
                                <div class="notch" style="left:` + pos + `%;"></div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-3">
                            <input type="text" data-id="` + key + `" value="` + sliders[key].val + `" pattern="[\-0-9]" />
                        </div>
                    </div>
                `;
            }

            $("div#filters").html(output);
            $("div#sliders").show();
            $("div#photo-select").hide();
            $("div#photo-editor").show();
            $("input#file").val("");
        };

        fr.readAsDataURL(file);
        $("button#photo-save").show();

        RestoreDefaults();
    });


    // on slider move:
    $(document).on("mousedown touchstart", "div.slider div.notch", function() {
        var key = $(this).parents("div.slider").data("id");

        slider = {
            id: key,
            press: true,
            notch: $(this)
        };
    });

    $(document).on("mousemove touchmove", function(event) {
        if (slider.press) {
            var start = $("div#sliders").position().left;
            var end   = $("div.slider").width();
            var move  = (event.type == "mousemove") ? event.pageX : event.originalEvent.changedTouches[0].pageX;
            var pos   = (move - start) - 40;

            if (pos >= -1 && pos <= end) {
                var value = Math.round(sliders[slider.id].max * (pos / end));

                sliders[slider.id].val = value;
                slider.notch.css({left: pos + "px"});

                $("input[data-id='" + slider.id + "']").val(value);

                Filters();
            }
        }
    });

    $(document).on("mouseup touchend", function() {
        slider = {
            id: "",
            press: false,
            notch: null
        };
    })


    // on input value change:
    $(document).on("keyup", "div#sliders input", function() {
        var key = $(this).data("id");
        var value = $(this).val();
        var invalid = false;
        var pos = 0;

        if (value < sliders[key].min) {
            value = sliders[key].min;
            invalid = true;
        }

        if (value > sliders[key].max) {
            value = sliders[key].max;
            invalid = true;
        }

        sliders[key].val = value;
        pos = Math.round((value / sliders[key].max) * 100);

        console.log(pos);

        $("div.slider[data-id='" + key + "'] div.notch").css({left: pos + "%"});

        if (invalid) {
            $(this).addClass("invalid");
        } else {
            $(this).removeClass("invalid");
        }

        Filters();
    });


    // on invert filter toggle:
    $(document).on("change", "input[data-id='invert']", function() {
        Filters();
    });


    // restore defaults:
    $(document).on("click", "button#restore-defaults", function() {
        RestoreDefaults();
    });


    // save new photo:
    $(document).on("click", "button#photo-save", function() {
        var image   = $("div#photo img")[0];
        var canvas  = document.createElement("canvas");
        var context = canvas.getContext("2d");

        canvas.width  = image_data.width;
        canvas.height = image_data.height;

        context.filter = filters;
        context.drawImage(image, 0, 0, image_data.width, image_data.height);

        $("body").append('<a id="download" href="' + canvas.toDataURL("image/jpeg") + '" download="photo.jpg"></a>');
        $("a#download")[0].click();

        setTimeout(function() {
            $("a#download").remove();
        }, 1000);
    });

});


// update filters:
function Filters() {
    var invert_checked = $("input[data-id='invert']").is(":checked");
    var invert_value = (invert_checked) ? 100 : 0;
        filters = "invert(" + invert_value + "%)";

    for (var key in sliders) {
        filters += " " + key + "(" + sliders[key].val + sliders[key].units + ")";
    }

    $("div#photo img").css({filter: filters});
}


// restore defaults:
function RestoreDefaults() {
    for (var key in sliders) {
        var value = sliders[key].def;
        var pos = Math.round((value / sliders[key].max) * 100);

        sliders[key].val = value;

        $("div.slider[data-id='" + key + "'] div.notch").css({left: pos + "%"});
        $("input[data-id='" + key + "']").val(value);
    }

    $("input[data-id='invert']").prop("checked", false);

    Filters();
}
