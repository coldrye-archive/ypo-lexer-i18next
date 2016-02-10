// vim: expandtab:ts=4:sw=4
/*
 * Copyright 2015-2016 Carsten Klein
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import fs from 'fs';
import path from 'path';

import {AbstractOption} from 'ypo-parser-common/option';
import Comment from 'ypo-parser-common/comment';
import Context from 'ypo-parser-common/context';
import EmptyLine from 'ypo-parser-common/emptyline';
import Location from 'ypo-parser-common/location';
import ParseError from 'ypo-parser-common/exceptions';
import Text from 'ypo-parser-common/text';
import TranslationId from 'ypo-parser-common/translationid';
import {
    OPTION_LANG, OPTION_NS, OPTION_PLURAL
} from 'ypo-parser-common/constants';

import {DEFAULT_SEPARATOR} from './constants';


/**
 * The class Lexer models a parser that produces a stream of tokens from an
 * i18next JSON file.
 */
export default class Lexer
{
    /**
     * @public
     * @param {object} options={} - the options
     * @param {string} options.contextSeparator=DEFAULT_SEPARATOR - the context separator
     * @param {string} options.pluralSeparator=DEFAULT_SEPARATOR - the plural separator
     * @returns {void}
     */
    constructor({
        contextSeparator = DEFAULT_SEPARATOR,
        pluralSeparator = DEFAULT_SEPARATOR
    } = {})
    {
        this._options = {
            contextSeparator : contextSeparator,
            pluralSeparator : pluralSeparator
        };
    }

    /**
     * Gets the options.
     *
     * @public
     * @returns {object} - the options
     */
    get options()
    {
        return this._options;
    }

    /**
     * Generates a stream of tokens from a i18next JSON input file.
     *
     * @public
     * @param {string} file - the absolute and resolved file name
     * @throws {ParseError}
     * @returns {AbstractToken} - the yielded token instances
     */
    * tokenize(file)
    {
        /* istanbul ignore else */
        if (typeof file != 'string' || file.length == 0)
        {
            throw new TypeError('MSG_file must be a non empty string');
        }

        this._keyRegExp = this.buildKeyRegExp();
        this._line = 1;
        this._file = file;
        this._json = JSON.parse(fs.readFileSync(file));

        for (const node of this.header())
        {
            yield node;
        }

        for (const node of this.unitOptions())
        {
            yield node;
        }

        for (const node of this.translations())
        {
            yield node;
        }

        yield EmptyLine.createNode(this.nextLocation());
    }

    /**
     * @private
     * @returns {Location} - the next location
     */
    nextLocation()
    {
        return new Location(this._file, this._line++);
    }

    /**
     * @private
     * @returns {AbstractNode} - the yielded tokens
     */
    * header()
    {
        yield Comment.createNode(
            this.nextLocation(), 'auto generated from ' + this._file
        );
    }

    /**
     * @private
     * @returns {AbstractNode} - the yielded tokens
     */
    * unitOptions()
    {
        yield EmptyLine.createNode(this.nextLocation());

        const lang = path.basename(path.dirname(this._file));
        const langOption = AbstractOption.createNode(
            this.nextLocation(), OPTION_LANG, lang
        );
        yield langOption;

        const namespace = path.basename(this._file, '.json');
        const namespaceOption = AbstractOption.createNode(
            this.nextLocation(), OPTION_NS, namespace
        );
        yield namespaceOption;
    }

    /**
     * @private
     * @returns {AbstractNode} - the yielded tokens
     */
    * translations()
    {
        const idmap = {};

        for (const key in this._json)
        {
            if (this.isInterval(key))
            {
                throw new ParseError(
                    'intervals are unsupported',
                    {location:this.nextLocation()}
                );
            }

            const match = key.match(this._keyRegExp);
            const id = match[1];
            const context = match[3];
            let cardinality = match[2] !== undefined ? match[2] : match[4];

            yield EmptyLine.createNode(this.nextLocation());

            if (idmap[id] == undefined)
            {
                idmap[id] = 1;
                yield TranslationId.createNode(this.nextLocation(), id);
            }

            if (cardinality)
            {
                yield AbstractOption.createNode(
                    this.nextLocation(), OPTION_PLURAL,
                    cardinality == 'plural' ? '' : cardinality
                );
            }

            if (context)
            {
                yield Context.createNode(this.nextLocation(), context);
            }

            for (const node of this.text(key))
            {
                yield node;
            }
        }
    }

    /**
     * @private
     * @param {string} key - the key
     * @returns {Text} - the yielded tokens
     */
    * text(key)
    {
        const text = this._json[key];

        /* istanbul ignore else */
        if (typeof text != 'string')
        {
            throw new ParseError(
                'arrays and trees are not supported',
                {location:this.nextLocation()}
            );
        }

        const parts = text.split('\n');
        for (let part of parts)
        {
            part = part.replace(/^#/, '\\#');
            if (part == '')
            {
                part = '\\n';
            }
            yield Text.createNode(this.nextLocation(), part);
        }
    }

    /**
     * @private
     * @returns {RegExp} - the key regexp
     */
    buildKeyRegExp()
    {
        let part = '(?:([^CTXPLU]+))'
                   + '(?:(?:[PLU](plural|[0-9]+))|'
                   + '(?:[CTX]([^PLU]+))(?:[PLU](plural|[0-9]+))?)?'

        part = part.replace(/CTX/g, this.options.contextSeparator);
        part = part.replace(/PLU/g, this.options.pluralSeparator);

        return new RegExp('^' + part + '$');
    }

    /**
     * @private
     * @param {string} key - the key
     * @returns {boolean} - true whether key is an interval
     */
    isInterval(key)
    {
        return key.indexOf(this.options.pluralSeparator + 'interval') != -1;
    }
}

