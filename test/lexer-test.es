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

import glob from 'glob';

import assert from 'esaver';

import ParseError from 'ypo-parser-common/exceptions';

import Lexer from '../src/lexer';


describe('Lexer',
function ()
{
    describe('when processing standard i18n input',
    function ()
    {
        const cut = new Lexer();

        const cases = glob.sync(
            path.join(__dirname, 'fixtures', 'locales', '**', '*.json')
        );

        for (const tc of cases)
        {
            describe('difference test for ' + adjustPath(tc),
            function ()
            {
                applyDifferenceTests(cut, tc);
            });
        }

        const negcases = glob.sync(
            path.join(__dirname, 'fixtures', 'failures', '**', '*.json')
        );

        for (const tc of negcases)
        {
            it('must fail on parse of ' + adjustPath(tc),
            function ()
            {
                const zeroDevice = [];
                assert.throws(
                function ()
                {
                    for(const token of cut.tokenize(tc))
                    {
                        zeroDevice.push(token);
                    }
                }, ParseError);
            });
        }
    });

    describe('when processing customized i18n input',
    function ()
    {
        const cut = new Lexer({contextSeparator:'~', pluralSeparator:'-'});

        const cases = glob.sync(
            path.join(__dirname, 'fixtures', 'separators', '**', '*.json')
        );

        for (const tc of cases)
        {
            describe('difference test for ' + adjustPath(tc),
            function ()
            {
                applyDifferenceTests(cut, tc);
            });
        }
    });

    it('#tokenize must fail on missing file',
    function ()
    {
        assert.throws(
        function ()
        {
            const cut = new Lexer();
            cut.tokenize().next();
        }, TypeError);
    });

    it('#tokenize must fail on empty string file',
    function ()
    {
        assert.throws(
        function ()
        {
            const cut = new Lexer();
            cut.tokenize('').next();
        }, TypeError);
    });
});


function applyDifferenceTests(cut, tc)
{
    const casedump = path.join(
        path.dirname(tc), path.basename(tc, '.json') + '.dump'
    );

    const actual = [];

    it('must parse without failure',
    function ()
    {
        for(const token of cut.tokenize(tc))
        {
            actual.push(adjustLocation(token.toString()));
        }
    });

    let casedumpstat;

    it('must have a comparable case dump',
    function ()
    {
        try
        {
            casedumpstat = fs.statSync(casedump);
        }
        /* eslint no-empty:0 */
        catch (err)
        {
        }

        try
        {
            assert.ok(casedumpstat);
        }
        catch (err)
        {
            expectationFailed(actual, err);
        }
    });

    it('case dump and actual must be equal',
    function ()
    {
        const expected = JSON.parse(fs.readFileSync(casedump));

        try
        {
            assert.deepEqual(actual, expected);
        }
        catch (err)
        {
            expectationFailed(actual, err);
        }
    });
}


function adjustLocation(s)
{
    return s.replace(/location=.+\/test/, 'location=test');
}


function adjustPath(s)
{
    return s.replace(/.+\/test/, 'test');
}


function expectationFailed(actual, err)
{
    console.log(
        '>>>> expectation may have failed due to changed input a/o behavior'
    );
    console.log(JSON.stringify(actual));
    console.log('<<<<');

    if (err)
    {
        throw err;
    }
}

