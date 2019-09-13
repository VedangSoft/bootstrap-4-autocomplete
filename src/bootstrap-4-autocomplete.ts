interface AutocompleteItem {
    value: string,
    label: string,
}

interface AutocompleteOptions {
    dropdownOptions?: Bootstrap.DropdownOption,
    highlightClass?: string,
    highlightTyped?: boolean,
    label?: string,
    maximumItems?: number,
    onSelectItem?: (item: AutocompleteItem) => void,
    source?: object,
    treshold?: number,
    value?: string,
}

interface JQuery {
    autocomplete(options: AutocompleteOptions): JQuery<HTMLElement>;
}

(function ( $ ) {

    let defaults: AutocompleteOptions = {
        treshold: 4,
        maximumItems: 5,
        highlightTyped: true,
        highlightClass: 'text-primary',
    };

    function createItem(lookup: string, item: AutocompleteItem, opts: AutocompleteOptions):string {
        let label: string;
        if (opts.highlightTyped) {
            const idx = item.label.toLowerCase().indexOf(lookup.toLowerCase());
            label = item.label.substring(0, idx)
                    + '<span class="' + opts.highlightClass + '">' + item.label.substring(idx, idx + lookup.length) + '</span>'
                    + item.label.substring(idx + lookup.length, item.label.length);
        } else {
            label = item.label;
        }
        return '<button type="button" class="dropdown-item" data-value="' + item.value + '">' + label + '</button>';
    }

    $.fn.autocomplete = function(options) {
        // merge options with default
        let opts: AutocompleteOptions = {};
        $.extend(opts, defaults, options);

        let _field = $(this);

        // clear previously set autocomplete
        _field.parent().removeClass('dropdown');
        _field.removeAttr('data-toggle');
        _field.removeClass('dropdown-toggle');
        _field.parent().find('.dropdown-menu').remove();
        _field.dropdown('dispose');
        
        // attach dropdown
        _field.parent().addClass('dropdown');
        _field.attr('data-toggle', 'dropdown');
        _field.addClass('dropdown-toggle');
        _field.after('<div class="dropdown-menu"></div>');
        _field.dropdown(opts.dropdownOptions);
        
        // prevent show empty
        this.off('click').click(function(e) {
            e.stopPropagation();
        });

        // show options
        this.off('keyup').keyup(function() {
            // sets up positioning
            _field.click();
            
            const lookup = _field.val() as string;
            if (lookup.length < opts.treshold) {
                _field.dropdown('hide');
                return;
            }

            const items = _field.next();
            items.html('');

            let count = 0;
            const keys = Object.keys(opts.source);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const object = opts.source[key];
                const item = {
                    label: opts.label ? object[opts.label] : key,
                    value: opts.value ? object[opts.value]: object,
                };
                if (item.label.toLowerCase().indexOf(lookup.toLowerCase()) >= 0) {
                    items.append(createItem(lookup, item, opts));
                    if (++count >= opts.maximumItems) {
                        break;
                    }
                }
            }

            if (items.children().length == 0) {
                return;
            }

            // option action
            _field.next().find('.dropdown-item').click(function() {
                _field.val($(this).text());
                if (opts.onSelectItem) {
                    opts.onSelectItem({
                        value: $(this).data('value'),
                        label: $(this).text(),
                    })
                }
            });

            _field.dropdown('show');
        });

        return this;
    };
}( jQuery ));
